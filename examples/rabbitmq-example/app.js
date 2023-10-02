const { orka } = require('../../build');
const ExampleHandler = require('./example-handler');
const { getRabbit } = require('../../build');

const w = orka({
  beforeMiddleware: () => [
    async (ctx, next) => {
      ctx.body = 'default body';
      await next();
    }
  ],
  diamorphosis: { configFolder: './examples/rabbitmq-example' },
  routesPath: './examples/rabbitmq-example/routes.js',
  logoPath: './examples/simple-example/logo.txt',
  beforeStart: config => {
    console.log(`Going to start env: ${config.nodeEnv}`);
  },
  rabbitOnConnected: () => {
    console.log('Custom rabbitOnConnected');
    new ExampleHandler('example_queue');
    getRabbit().bindToTopic('example_queue', '*.example');
  }
});

if (!module.parent) {
  w.start();
}

module.exports = w;
