const { builder } = require('../../build');

const staticOptions = { diamorphosis: { configFolder: './examples/simple-example' } };

const w = builder(staticOptions)
  .forTypescript()
  .useDefaults()
  .with(config => console.log(`Going to Start env: ${config.nodeEnv}`))
  .use(async (ctx, next) => {
    ctx.body = 'default body';
    await next();
  })
  .routes('./examples/simple-example/routes.js')
  .withLogo('./examples/simple-example/logo.txt');

if (!module.parent) {
  w.start();
}

w.name = 'builder-example';
module.exports = w;
