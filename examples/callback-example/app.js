const { orka, builder } = require('../../build');

const orkaBuilder = builder({
  diamorphosis: { configFolder: './examples/simple-example' }
});

const w = orka({
  builder: orkaBuilder,
  typescript: false,
  beforeMiddleware: () => [
    async (ctx, next) => {
      ctx.body = 'default body';
      await next();
    }
  ],
  routesPath: './examples/simple-example/routes.js',
  logoPath: './examples/simple-example/logo.txt',
  beforeStart: () => {
    const config = require('../simple-example/config');
    console.log(`Going to start env: ${config.nodeEnv}`);
  }
});

if (!module.parent) {
  const http = require('http');
  http.createServer(w.callback()).listen(3000);
}

module.exports = w;
