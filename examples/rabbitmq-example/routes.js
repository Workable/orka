const { getRabbit, getLogger } = require('../../build');
const config = require('./config');

const rabbit = getRabbit();

module.exports = {
  get: {
    '/init': async (ctx, next) => {
      rabbit
        .publish('example_queue', { test: 'data' }, { correlationId: '1' })
        .then(() => console.log('message published'));
    }
  }
};
