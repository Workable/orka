const { getRabbit } = require('../../build');
const rabbit = getRabbit();

module.exports = {
  get: {
    '/init': async (ctx, next) => {
      await rabbit.publish('example_queue', { test: 'data' }, { correlationId: '1' });
    }
  }
};
