const User = require('./user');
const { middlewares: {health} } = require('../../build');

module.exports = {
  get: {
    '/health': health,
    '/users': async (ctx, next) => {
      ctx.body = await User.find();
    }
  }
};
