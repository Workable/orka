import { defaultsDeep, has, keyBy, map } from 'lodash';
import * as cron from 'node-cron';
import { getLogger } from '../log4js';
import requireInjected from '../../require-injected';
const Queue = requireInjected('bull');
const newrelic = process.env.NEW_RELIC_LICENSE_KEY ? requireInjected('newrelic') : null;

export default class Bull {
  private logger = getLogger('orka.bull');
  private prefix: string;
  private defaultOptions: any;
  private redisOpts: any;
  private queueOpts: { [x: string]: { options: any } };
  private queueNames: string[];
  private instances = {};
  private metricsTask: any;

  constructor(prefix, queueOpts, defaultOptions, redisOpts) {
    this.prefix = prefix;
    this.defaultOptions = defaultOptions;
    this.queueOpts = keyBy(queueOpts, 'name');
    this.queueNames = map(queueOpts, 'name');
    this.redisOpts = redisOpts;
  }

  private createQueue(name: string) {
    const fullName = `${this.prefix}:${name}`;
    const options = this.queueOpts[name].options;
    this.logger.info(`Creating Queue: ${fullName}`);
    const defaultJobOptions = defaultsDeep({}, options, this.defaultOptions);
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

  public getQueue(name: string) {
    if (!has(this.queueOpts, name)) {
      throw new Error('no such queue');
    }
    if (!has(this.instances, name)) {
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

  private recordMetric(key: string, value: number) {
    if (newrelic) {
      newrelic.recordMetric(key, value);
    } else {
      getLogger('bull.metrics').info(`${key}: ${value}`);
    }
  }

  private async reportStats() {
    const stats = await this.getStats();
    stats.forEach(entry => {
      this.recordMetric(`Bull/Queues/${entry.queue}`, entry.count);
      this.recordMetric(`Bull/QueuesFailed/${entry.queue}`, entry.failed);
    });
  }

  public startMetrics(cronExpression) {
    if (!cron.validate(cronExpression)) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }
    if (this.metricsTask) {
      throw new Error('Metrics task already running');
    }
    this.logger.info(`Scheduled queue metrics reporting with cron: "${cronExpression}"`);
    const output = newrelic ? 'new relic' : 'logs';
    this.metricsTask = cron.schedule(cronExpression, async () => {
      getLogger('bull.metrics').info(`Sending queue metrics to ${output}`);
      await this.reportStats();
    });
  }

  public stopMetrics() {
    if (!this.metricsTask) {
      throw new Error('Metrics task not currently running');
    }
    this.metricsTask.destroy();
    this.metricsTask = null;
  }
}

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
