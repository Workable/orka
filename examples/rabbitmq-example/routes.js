const { getRabbit, getLogger } = require('../../build');
const logger = getLogger('router');
const {
  middlewares: { health }
} = require('../../build');

module.exports = {
  get: {
    health: health,
    '/test': async (ctx, next) => {
      ctx.body = ctx.headers;
    },
    '/init': async (ctx, next) => {
      const rabbit = getRabbit();
      ctx.body = await rabbit.getReply('example_queue', { test: 'data' });
    },
    '/exchange': async (ctx, next) => {
      logger.info('sending to rabbit');
      const rabbit = getRabbit();
      await rabbit.publishTopic('.example', { test: 'data' });
    }
  }
};
