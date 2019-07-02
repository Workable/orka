const { getRabbit, getLogger } = require('../../build');
const config = require('./config');

const ExampleHandler = require('./example-handler');

const rabbit = getRabbit();

new ExampleHandler('example_queue');

module.exports = {
  get: {
    '/init': async (ctx, next) => {
      // rabbit
      //   .createQueue('example_queue', { durable: false }, (msg, ack) => {
      //     console.log(msg.content.toString());
      //     ack(null, 'response');
      //   })
      //   .then(() => console.log('queue created'));
      rabbit
        .publish('example_queue', { test: 'data' }, { correlationId: '1' })
        .then(() => console.log('message published'));
    }
  }
};
