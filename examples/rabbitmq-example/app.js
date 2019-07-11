const { orka } = require('../../build');
const config = require('./config');
const ExampleHandler = require('./example-handler');

orka({
  beforeMiddleware: [
    async (ctx, next) => {
      ctx.body = 'default body';
      await next();
    }
  ],
  diamorphosis: { configFolder: './examples/rabbitmq-example' },
  routesPath: './examples/rabbitmq-example/routes.js',
  logoPath: './examples/simple-example/logo.txt',
  beforeStart: () => console.log(`Going to start env: ${config.nodeEnv}`),
  rabbitOnConnected: () => new ExampleHandler('example_queue')
}).start();
