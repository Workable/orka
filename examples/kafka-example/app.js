const { orka } = require('../../build');

orka({
  beforeMiddleware: [
    async (ctx, next) => {
      ctx.body = 'default body';
      await next();
    }
  ],
  diamorphosis: { configFolder: './examples/kafka-example' },
  routesPath: './examples/kafka-example/routes.js',
  logoPath: './examples/simple-example/logo.txt',
  beforeStart: () => {
    const config = require('./config');
    console.log(`Going to start env: ${config.nodeEnv}`);
  }
}).start();
