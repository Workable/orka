const { orka, builder } = require('../../build');

const examplePath = './examples/simple-example-two-steps';
const orkaBuilder = builder({
  diamorphosis: { configFolder: examplePath }
});

const w = orka({
  builder: orkaBuilder,
  typescript: false,
  beforeMiddleware: [
    async (ctx, next) => {
      ctx.body = 'default body';
      await next();
    }
  ],
  routesPath: `${examplePath}/routes.js`,
  logoPath: `${examplePath}/logo.txt`,
  beforeStart: () => {
    const config = require('./config');
    console.log(`Going to start env: ${config.nodeEnv}`);
  }
});

if (!module.parent) {
  w.start();
}

module.exports = w;
