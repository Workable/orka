const { getBull, getLogger } = require('../../build');
const path = require('path');
const { v4: uuid } = require('uuid');
const { metrics } = require('../../build/middlewares');
const bull = getBull();

const logger = getLogger('bull-example');
const queueLogger = getLogger(`queue_one:${process.pid}`);

module.exports = {
  get: {
    '/metrics': metrics,
    '/init': async (ctx, next) => {
      bull.createWorker('queue_one', (job) => {
        // with done(error, results) callback
        const { id, data } = job;
        queueLogger.info(`Processing job #${id}`);
        queueLogger.info({ id, data });
      });
      // Sand-boxed Processor
      // see: https://optimalbits.github.io/bull/#sandboxed-processors
      bull.createWorker('queue_two', path.join(process.cwd(), './examples/bull-example/sandboxed-handler.js'));
      ctx.body += `Queues queue_one queue_two are ready to process messages`;
    },
    '/add/one': async (ctx, next) => {
      await bull
        .getQueue('queue_one')
        .add('job name one', { uuid: uuid() })
        .then(job => {
          const message = `Added job #${job.id} to Queue "${job.queue.name}"`;
          logger.info(message);
          ctx.body += message;
          ctx.status = 200;
        });
    },
    '/add/two': async (ctx, next) => {
      await bull
        .getQueue('queue_two')
        .add('job name two', { uuid: uuid() })
        .then(job => {
          const message = `Added job #${job.id} to Queue "${job.queue.name}"`;
          logger.info(message);
          ctx.body += message;
          ctx.status = 200;
        });
    }
  }
};
