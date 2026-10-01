const { orka } = require('../../build');

const w = orka({
  diamorphosis: { configFolder: './examples/default-middlewares-example' },
  routesPath: './examples/default-middlewares-example/routes.js',
  beforeStart: () => {
    const config = require('./config');
    console.log(`Going to start env: ${config.nodeEnv}`);
  }
});

if (!module.parent) {
  w.start();
}

module.exports = w;
