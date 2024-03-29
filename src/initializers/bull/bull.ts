import * as _ from 'lodash';
import { getLogger } from '../log4js';
import requireInjected from '../../require-injected';
import Prometheus from '../prometheus/prometheus';
import { JobCounts } from 'bull';

const Queue = requireInjected('bull');
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

  constructor(prefix, queueOpts, defaultOptions, redisOpts, prometheus?: Prometheus) {
    this.prefix = prefix;
    this.defaultOptions = defaultOptions;
    this.queueOpts = _.keyBy(queueOpts, 'name');
    this.queueNames = _.map(queueOpts, 'name');
    this.redisOpts = redisOpts;
    this.prometheus = prometheus;
    this.registerMetrics();
  }

  private createQueue(name: string) {
    const fullName = `${this.prefix}:${name}`;
    const options = this.queueOpts[name].options;
    const limiter = this.queueOpts[name].limiter;
    const defaultJobOptions = _.defaultsDeep({}, options, this.defaultOptions);
    const queueOptions = { redis: this.redisOpts, defaultJobOptions, ...(limiter && { limiter }) };
    this.logger.info(`Creating Queue: ${fullName}`);
    const queue = new Queue(fullName, queueOptions);
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
    this.instances[name] = queue;
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
    if (!_.has(this.instances, name)) {
      this.createQueue(name);
    }
    return this.instances[name];
  }

  private async fetchStats(name: string): Promise<BullStats> {
    const q = this.getQueue(name);
    const counts: JobCounts = await q.getJobCounts();

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
