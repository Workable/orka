const User = require('./user');
const { health } = require('../../build/middlewares');

module.exports = {
  get: {
    '/health': health,
    '/users': async (ctx, next) => {
      ctx.body = await User.find();
    }
  }
};
