import * as _ from 'lodash';
import { getLogger } from '../log4js';
import requireInjected from '../../require-injected';
import Prometheus from '../prometheus/prometheus';
const Redis = require('ioredis');

const { Queue, Worker } = requireInjected('bullmq');

export default class Bull {
  private logger = getLogger('orka.bull');
  private prefix: string;
  private defaultOptions: any;
  private redisOpts: any;
  private queueOpts: { [x: string]: { options: any; limiter: any } };
  private queueNames: string[];
  private instances = {};
  private metrics;
  private prometheus: Prometheus;
  private reuseClients: boolean;
  private sharedRedisClient;
  private sharedRedisSubscriber;

  constructor(prefix, queueOpts, defaultOptions, redisOpts, prometheus?: Prometheus, reuseClients = false) {
    this.prefix = prefix;
    this.defaultOptions = defaultOptions;
    this.queueOpts = _.keyBy(queueOpts, 'name');
    this.queueNames = _.map(queueOpts, 'name');
    this.redisOpts = redisOpts;
    this.prometheus = prometheus;
    this.registerMetrics();
    this.reuseClients = reuseClients;
    if (reuseClients) {
      this.sharedRedisClient = new Redis(redisOpts);
      this.sharedRedisClient.setMaxListeners(50);
      this.sharedRedisSubscriber = new Redis({
        ...redisOpts,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      });
      this.sharedRedisSubscriber.setMaxListeners(50);
    }
  }

  private createQueue(name: string) {
    const options = this.createOptions(name);
    const defaultJobOptions = _.defaultsDeep({}, this.queueOpts[name].options, this.defaultOptions);

    this.logger.info(`Creating Queue: ${name}`);

    const queue = new Queue(name, {
      ...options,
      defaultJobOptions,
    });

    this.instances[name] = { queue };
  }

  public createWorker(name: string, handler: any) {
    if (!_.has(this.queueOpts, name)) {
      throw new Error('no such worker');
    }
    if (_.has(this.instances, [name, 'worker'])) {
      this.logger.warn(`Worker ${name} already exists`);

      return this.instances[name].worker;
    }

    const limiter = this.queueOpts[name].limiter;
    const options = this.createOptions(name);

    this.logger.info(`Creating Worker: ${name}`);
    const worker = new Worker(name, handler, { ...options, ...(limiter && { limiter })});
    worker
    .on('drained', () => {
      getLogger(name).info(`Queue drained`);
    })
    .on('error', err => {
      handleError(name, err);
    })
    .on('failed', (job, err) => {
      handleFailure(name, job, err);
    });

    this.instances[name] = { worker };

    return worker;
  }

  private createOptions(name: string) {
    const sharedRedisClient = this.sharedRedisClient;
    const sharedRedisSubscriber = this.sharedRedisSubscriber;
    const reuseOptions = {
      createClient: function (type, redisOpts) {
        switch (type) {
          case 'client':
            return sharedRedisClient;
          case 'subscriber':
            return sharedRedisSubscriber;
          case 'bclient':
            return new Redis({
              ...redisOpts,
              enableReadyCheck: false,
              maxRetriesPerRequest: null,
            });
          default:
            throw new Error('Unexpected connection type: ' + type);
        }
      },
    };
    const queueOptions = {
      connection: this.redisOpts,
      prefix: this.prefix,
    };

    return this.reuseClients ? _.defaultsDeep(queueOptions, reuseOptions) : queueOptions;
  }

  // Register prometheus metrics, if prometheus is available
  private registerMetrics() {
    if (!this.prometheus) {
      this.logger.warn(`Prometheus metrics not enabled, Bull queue metrics will not be exported`);
      return;
    }
    try {
      this.metrics = {
        depth: this.prometheus.registerGauge('external', 'bull_queue_depth', 'Bull Jobs in Queue', ['queue']),
        active: this.prometheus.registerGauge('external', 'bull_queue_active', 'Bull Jobs Active', ['queue']),
        completed: this.prometheus.registerGauge('external', 'bull_queue_completed', 'Bull Jobs Completed', ['queue']),
        failed: this.prometheus.registerGauge('external', 'bull_queue_failed', 'Bull Jobs Failed', ['queue']),
        delayed: this.prometheus.registerGauge('external', 'bull_queue_delayed', 'Bull Jobs Delayed', ['queue']),
        waiting: this.prometheus.registerGauge('external', 'bull_queue_waiting', 'Bull Jobs Waiting', ['queue'])
      };
    } catch (err) {
      this.logger.error(err);
    }
  }

  // Update prometheus metrics on demand
  public async updateMetrics() {
    if (!this.prometheus || !this.metrics) {
      this.logger.error(new Error('Prometheus metrics not enabled, Bull queue metrics will not be exported'));
      return;
    }
    try {
      const stats: BullStats[] = await this.getStats();
      stats.forEach(({ queue, count, active, completed, failed, delayed, waiting }) => {
        this.metrics.depth.set({ queue }, count);
        this.metrics.active.set({ queue }, active);
        this.metrics.completed.set({ queue }, completed);
        this.metrics.failed.set({ queue }, failed);
        this.metrics.delayed.set({ queue }, delayed);
        this.metrics.waiting.set({ queue }, waiting);
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  public getQueue(name: string) {
    if (!_.has(this.queueOpts, name)) {
      throw new Error('no such queue');
    }
    if (!_.has(this.instances, [name, 'queue'])) {
      this.createQueue(name);
    }
    return this.instances[name].queue;
  }

  public getWorker(name: string, handler: any) {
    if (!_.has(this.queueOpts, name) || !_.has(this.instances, [name, 'worker'])) {
      throw new Error('no such worker');
    }

    return this.instances[name].worker;
  }

  private async fetchStats(name: string): Promise<BullStats> {
    const q = this.getQueue(name);
    const counts = await q.getJobCounts();

    return {
      queue: name,
      count: await q.count(),
      active: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
      waiting: counts.waiting
    };
  }

  public getStats(): Promise<BullStats[]> {
    const stats = this.queueNames.map(this.fetchStats, this);
    return Promise.all(stats);
  }
}

export interface BullStats {
  queue: string;
  count: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  waiting: number;
}

const handleFailure = (name, job, error) => {
  if (job.attemptsMade === job.opts.attempts) {
    getLogger(name).error(error);
  } else {
    getLogger(name).warn(`Job #${job.id} failed. Attempt ${job.attemptsMade}/${job.opts.attempts} Retrying`);
  }
};

const handleError = (name, err) => {
  getLogger(name).error(err);
};
