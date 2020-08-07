import { defaultsDeep, has } from 'lodash';
import { getLogger } from '../log4js';
import requireInjected from '../../require-injected';

const INSTANCES = {};
const Queue = requireInjected('bull');
const logger = getLogger('orka.bull');
let prefix: string;
let defaultOptions: any;
let redisOpts: any;
let queues: { [x: string]: { options: any } };
let ready: Boolean = false;

export const init = (
  appName: string,
  registeredQueues: Array<{ options: any; name: string }>,
  defaults: any,
  redis: any
) => {
  prefix = appName;
  defaultOptions = defaults;
  redisOpts = redis;
  queues = registeredQueues.reduce((acc, q) => {
    acc[q.name] = q;
    return acc;
  }, {});
  ready = true;
};

const createQueue = name => {
  const fullName = `${prefix}:${name}`;
  const options = queues[name].options;
  logger.info(`Creating Queue: ${fullName}`);
  const defaultJobOptions = defaultsDeep({}, options, defaultOptions);
  const queue = new Queue(fullName, { redis: redisOpts, defaultJobOptions });
  queue
    .on('drained', () => {
      getLogger(fullName).info(`Queue drained`);
    })
    .on('error', err => {
      handleError(fullName, err);
    })
    .on('failed', (job, err) => {
      handleFailure(fullName, job, err);
    });
  // Cache the instance
  INSTANCES[name] = queue;
};

const handleFailure = (name, job, error) => {
  if (job.attemptsMade === job.opts.attempts) {
    getLogger(name).error(error);
  } else {
    getLogger(name).warn(`Job with ${job.id} failed. Attempt ${job.attemptsMade}/${job.opts.attempts} Retrying`);
  }
};

const handleError = (name, err) => {
  getLogger(name).error(err);
};

const readinessCheck = () => {
  if (!ready) {
    throw new Error('bull is not initialized');
  }
};

/**
 * Returns a Queue instance by its name.
 *
 * @param name The simple (no prefix needed here) name of the Queue
 */
export const getQueue = (name: string) => {
  readinessCheck();
  if (!has(queues, name)) {
    throw new Error('no such queue');
  }
  if (!has(INSTANCES, name)) {
    createQueue(name);
  }
  return INSTANCES[name];
};

/**
 * Returns an array with all the queues.
 */
export const getAllQueues = () => {
  readinessCheck();
  return Object.keys(queues).map(getQueue);
};

/**
 * Returns queue statistics
 */
export const getStats = async (): Promise<{ queue: string; count: number; failed: number }[]> => {
  readinessCheck();
  const fetchStats = async queue => ({
    queue: queue.name,
    count: await queue.count(),
    failed: await queue.getFailedCount()
  });
  const stats = getAllQueues().map(fetchStats);
  return Promise.all(stats);
};
