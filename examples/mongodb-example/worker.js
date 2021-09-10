const app = require('./app');
const worker = app.createWorker('test-worker');

worker.start(
  (job, logger) => {
    job.payload = { progress: 0 };
  },
  async (job, logger) => {
    const progress = job.payload.progress;
    for (let i = progress + 1; i < 100; i++) {
      await worker.WorkerJob.findOneAndUpdate({ _id: job._id }, { $set: { payload: { progress: i } } });
      logger.info('setting progress to ', i);
      await new Promise(r => setTimeout(r, 100));
    }
  }
);
