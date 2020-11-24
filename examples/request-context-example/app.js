const { orka, getRequestContext } = require('../../build');

const w = orka({
  beforeMiddleware: () => [
    async function defaultMiddleware(ctx, next) {
      ctx.body = 'default body';
      await next();
    }
  ],
  afterMiddleware: () => [
    async (ctx, next) => {
      const store = getRequestContext();
      if (store) {
        store.set('afterMiddleware', 'orka');
      }
      await next();
    }
  ],
  diamorphosis: { configFolder: './examples/request-context-example' },
  routesPath: './examples/request-context-example/routes.js',
  beforeStart: () => {
    const config = require('./config');
    console.log(`Going to start env: ${config.nodeEnv}`);
  }
});

if (!module.parent) {
  w.start();
}

module.exports = w;
