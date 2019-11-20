const { getRedis } = require('../../build');
const { promisify } = require('util');

const redis = getRedis();
module.exports = {
  get: {
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
