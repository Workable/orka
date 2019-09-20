const { getRabbit } = require('../../build');

module.exports = {
  get: {
    '/init': async (ctx, next) => {
      const rabbit = getRabbit();
      await rabbit.publish('example_queue', { test: 'data' }, { correlationId: '1' });
    }
  }
};
