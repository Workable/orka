const { getRabbit } = require('../../build');
const {
  middlewares: { health }
} = require('../../build');

module.exports = {
  get: {
    health: health,
    '/init': async (ctx, next) => {
      const rabbit = getRabbit();
      await rabbit.publish('example_queue', { test: 'data' }, { correlationId: '1' });
    }
  }
};
