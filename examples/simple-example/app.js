const { orka } = require('../../build');
const path = require('path');

orka({
  beforeMiddleware: [
    async (ctx, next) => {
      ctx.body = 'default body';
      await next();
    }
  ],
  diamorphosis: { configFolder: './examples/simple-example' },
  routesPath: './examples/simple-example/routes.js'
}).start();
