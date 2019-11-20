const { orka } = require('../../build');

orka({
  diamorphosis: { configFolder: './examples/redis-example' },
  routesPath: './examples/redis-example/routes.js',
  logoPath: './examples/redis-example/logo.txt',
  beforeStart: () => {
    const config = require('./config');
    console.log(`Going to start env: ${config.nodeEnv}`);
  }
}).start();
