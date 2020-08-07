const { getBull, getLogger } = require('../../build');
const path = require('path');
const uuid = require('uuid/v4');
const bull = getBull();

const logger = getLogger('bull-example');
const queueLogger = getLogger(`queue_one:${process.pid}`);

module.exports = {
  get: {
    '/init': async (ctx, next) => {
      bull.getQueue('queue_one').process((job, done) => {
        // with done(error, results) callback
        const { id, data } = job;
        queueLogger.info(`Processing job #${id}`);
        queueLogger.info({ id, data });
        done();
      });
      // Sand-boxed Processor
      // see: https://optimalbits.github.io/bull/#sandboxed-processors
      bull.getQueue('queue_two').process(path.join(process.cwd(), './examples/bull-example/sandboxed-handler.js'));
      ctx.body += `Queues queue_one queue_two are ready to process messages`;
    },
    '/add/one': async (ctx, next) => {
      await bull
        .getQueue('queue_one')
        .add({ uuid: uuid() })
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
        .add({ uuid: uuid() })
        .then(job => {
          const message = `Added job #${job.id} to Queue "${job.queue.name}"`;
          logger.info(message);
          ctx.body += message;
          ctx.status = 200;
        });
    },
    '/stats': async (ctx, next) => {
      const stats = await bull.getStats();
      ctx.body += `Stats\n==================\n${stats.map(JSON.stringify).join('\n')}`;
      ctx.status = 200;
    }
  }
};
