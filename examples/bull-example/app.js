const { orka } = require('../../build');

orka({
  beforeMiddleware: () => [
    async (ctx, next) => {
      ctx.body = 'default body';
      await next();
    },
  ],
  diamorphosis: { configFolder: './examples/bull-example' },
  routesPath: './examples/bull-example/routes.js',
  logoPath: './examples/simple-example/logo.txt',
  beforeStart: () => {
    const config = require('./config');
    console.log(`Going to start env: ${config.nodeEnv}`);
  },
}).start();
