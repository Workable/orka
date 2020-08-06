import { defaultsDeep, has } from 'lodash';
import { getLogger } from '../log4js';
import requireInjected from '../../require-injected';

const Queue = requireInjected('bull');

const CACHE = {};
const logger = getLogger('orka.bull');

export const createQueue = (prefix, queueConfig, defaultOptions, redisOpts) => {
  const fullName = `${prefix}:${queueConfig.name}`;
  logger.info(`Creating Queue: ${fullName}`);
  const defaultJobOptions = defaultsDeep({}, queueConfig.options, defaultOptions);
  const options = { redis: redisOpts, defaultJobOptions };
  const queue = new Queue(fullName, options);
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
  CACHE[queueConfig.name] = queue;
  return queue;
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

/**
 * Returns a Queue instance by its name.
 *
 * @param name The simple (no prefix needed here) name of the Queue
 */
export const getQueue = (name: string) => {
  if (!has(CACHE, name)) {
    throw new Error('no such queue');
  }
  return CACHE[name];
};
