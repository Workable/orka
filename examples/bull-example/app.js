const { orka } = require('../../build');
const fs = require('fs');

orka({
  beforeMiddleware: (app, config) => [
    async (ctx, next) => {
      const logo = config.printLogo ? fs.readFileSync('./examples/bull-example/logo.txt') : '';
      ctx.body = `${logo}
INSTRUCTIONS:
=============      
1) use /init to start the queue processing
2) use /add/one to add a job to the queue_one
3) use /add/two to add a job to the queue_two
4) use /metrics to see queue exported metrics (prometheus)

`;
      await next();
    }
  ],
  diamorphosis: { configFolder: './examples/bull-example' },
  routesPath: './examples/bull-example/routes.js',
  logoPath: './examples/bull-example/logo.txt',
  beforeStart: () => {
    const config = require('./config');
    console.log(`Going to start env: ${config.nodeEnv}`);
    console.log(`Pid: ${process.pid}`);
  }
}).start();
