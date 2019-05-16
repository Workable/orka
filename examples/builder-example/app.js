const { builder } = require('../../build');

const staticOptions = { diamorphosis: { configFolder: './examples/simple-example' } };

builder(staticOptions)
  .forTypescript()
  .useDefaults()
  .with(config => console.log(`Going to Start env: ${config.nodeEnv}`))
  .use(async (ctx, next) => {
    ctx.body = 'default body';
    await next();
  })
  .routes('./examples/simple-example/routes.js')
  .start();
