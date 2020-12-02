import * as _ from 'lodash';
import { getLogger } from '../log4js';
import requireInjected from '../../require-injected';

const Queue = requireInjected('bull');
export default class Bull {
  private logger = getLogger('orka.bull');
  private prefix: string;
  private defaultOptions: any;
  private redisOpts: any;
  private queueOpts: { [x: string]: { options: any } };
  private queueNames: string[];
  private instances = {};
  private metrics;
  private prometheus;

  constructor(prefix, queueOpts, defaultOptions, redisOpts, prometheus?) {
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
    this.logger.info(`Creating Queue: ${fullName}`);
    const defaultJobOptions = _.defaultsDeep({}, options, this.defaultOptions);
    const queue = new Queue(fullName, { redis: this.redisOpts, defaultJobOptions });
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
        depth: this.prometheus.registerGauge('bull_queue_depth', 'Bull Jobs in Queue', ['queue']),
        failed: this.prometheus.registerGauge('bull_queue_failed', 'Bull Jobs Failed', ['queue'])
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
      const stats = await this.getStats();
      stats.forEach(({ queue, count, failed }) => {
        this.metrics.depth.set({ queue }, count);
        this.metrics.failed.set({ queue }, failed);
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

  private async fetchStats(name): Promise<{ queue: string; count: number; failed: number }> {
    const q = this.getQueue(name);
    return {
      queue: name,
      count: await q.count(),
      failed: await q.getFailedCount()
    };
  }

  public getStats() {
    const stats = this.queueNames.map(this.fetchStats, this);
    return Promise.all(stats);
  }

  public startMetrics(cronExpression, queueNameCase?: string) {
    this.logger.warn(
      '***\nDEPRECATED: See https://github.com/Workable/orka/blob/master/README.md how to configure the Metrics middleware\n***'
    );
  }

  public stopMetrics() {
    this.logger.warn(
      '***\nDEPRECATED: See https://github.com/Workable/orka/blob/master/README.md how to configure the Metrics middleware\n***'
    );
  }
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
