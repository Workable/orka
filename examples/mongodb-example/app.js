const { orka } = require('../../build');

const w = orka({
  beforeMiddleware: () => [
    async (ctx, next) => {
      ctx.body = 'default body';
      await next();
    }
  ],
  diamorphosis: { configFolder: './examples/mongodb-example' },
  routesPath: './examples/mongodb-example/routes.js',
  logoPath: './examples/simple-example/logo.txt',
  beforeStart: () => {
    const config = require('./config');
    console.log(`Going to start env: ${config.nodeEnv}`);
  }
});

if (!module.parent) {
  w.start();
}

module.exports = w;
