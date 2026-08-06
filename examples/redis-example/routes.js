const { getRedis } = require('../../build');
const {
  middlewares: { health }
} = require('../../build');

const redis = getRedis();
module.exports = {
  get: {
    health: health,
    '/key': async (ctx, next) => {
      ctx.body = await redis.get('key');
    }
  },
  put: {
    '/key': async (ctx, next) => {
      ctx.body = await redis.set('key', ctx.request.body.key);
    }
  }
};
