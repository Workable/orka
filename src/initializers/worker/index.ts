import { Logger } from 'log4js';
import type OrkaBuilderType from '../../orka-builder';
import { getLogger } from '../log4js';
import type { default as WorkerJobType, JobDocument } from './worker-job';

export default class Worker {
  logger: Logger;
  WorkerJob: typeof WorkerJobType;
  config: any;
  constructor(public orkaInstance: OrkaBuilderType, public name: string) {
    this.config = orkaInstance.config;
  }

  async start(
    initializeCB: (job: JobDocument, logger: Logger) => Promise<JobDocument | void>,
    executeCB: (job: JobDocument, logger: Logger) => void
  ) {
    await this.orkaInstance.initTasks();
    this.logger = getLogger(`workers.${this.name}`);
    this.WorkerJob = (await import('./worker-job')).default;
    try {
      let job = await this.init(initializeCB);

      if (job.finished) {
        this.logger.info(
          `Worker finished processing. Will check again in ${this.config.workers.retryDelay / 60 / 1000} minutes`
        );
        await new Promise(r => setTimeout(r, this.config.workers.retryDelay));
        return this.start(initializeCB, executeCB);
      }

      await this.exec(job, executeCB);
    } catch (e) {
      this.logger.error(e, `Errored will retry in  ${this.config.workers.initializationCheckDelay / 1000} secs`);
      await new Promise(r => setTimeout(r, this.config.workers.initializationCheckDelay));
      return this.start(initializeCB, executeCB);
    }
  }

  async init(initializeCB: (job: JobDocument, logger: Logger) => Promise<JobDocument | void>) {
    this.logger.info(`Starting worker `);
    let job: JobDocument = await this.WorkerJob.findOne({ name: this.name });
    if (!job) job = new this.WorkerJob({ name: this.name });
    if (!job.initialized) {
      const initializedJob = await initializeCB(job, this.logger);
      if (initializedJob) job = initializedJob; // in case initializeCB has reloaded job
      job.initialized = true;
      await job.save();
      this.logger.info('Worker initialized.');
    }
    return job;
  }

  async exec(job, executeCB: (job: JobDocument, logger: Logger) => void) {
    this.logger.info('Worker starting processing');
    await executeCB(job, this.logger);
    job.finished = true;
    await job.save();
    this.logger.info('Worker finished processing.');
  }
}
