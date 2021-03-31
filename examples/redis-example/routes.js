const { getRedis } = require('../../build');
const { promisify } = require('util');
const {
  middlewares: { health }
} = require('../../build');

const redis = getRedis();
module.exports = {
  get: {
    health: health,
    '/key': async (ctx, next) => {
      ctx.body = await promisify(redis.get.bind(redis))('key');
    }
  },
  put: {
    '/key': async (ctx, next) => {
      ctx.body = await promisify(redis.set.bind(redis))('key', ctx.request.body.key);
    }
  }
};
