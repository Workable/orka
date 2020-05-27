import Queue = require('bull');
import { getLogger } from 'log4js';
import registry from './queue-registry';

export default class BaseQueue {
  queue: Queue.Queue<any>;
  _logger: any;
  static _initialize(name, options): Queue.Queue {
    const queue = registry.getQueue(name, options);
    return queue;
  }

  constructor(options = {}) {
    this.queue = (this.constructor as typeof BaseQueue)._initialize(
      this.name(),
      options
    );
  }

  name(): string {
    return 'base';
  }

  get(): Queue.Queue {
    return this.queue;
  }

  get logger(): any {
    if (!this._logger) {
      this._logger = getLogger(`queue.${this.name()}`);
    }
    return this._logger;
  }

  // Override these methods in subclass
  async processor(data): Promise<any> {}
  async beforeProcess(): Promise<any> {}

  process(): Promise<any> {
    return Promise.resolve()
      .then(() => this.beforeProcess())
      .then(() =>
        this.queue.process((job) => {
          this.logger.info(
            `[${this.queue.name}] Processing job ${job.id}: ${JSON.stringify(
              job.data
            )}`
          );
          return this.processor(job.data);
        })
      );
  }

  add(job: any, options = {}): Promise<any> {
    return this.queue.add(job, options);
  }

  static add(job: any, options = {}): Promise<any> {
    const queue = new this();
    return queue.add(job, options);
  }

  static process(): Promise<any> {
    const queue = new this();
    return queue.process();
  }
}
