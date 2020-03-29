const { orka } = require('../../build');

const w = orka({
  diamorphosis: { configFolder: './examples/simple-example' },
  routesPath: './examples/validation-example/routes.js',
  logoPath: './examples/simple-example/logo.txt',
  beforeStart: () => {
    const config = require('../simple-example/config');
    console.log(`Going to start env: ${config.nodeEnv}`);
  }
});

if (!module.parent) {
  w.start();
}

module.exports = w;
