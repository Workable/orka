const { builder } = require('../../build');

const staticOptions = { diamorphosis: { configFolder: './examples/simple-example' } };

const w = builder(staticOptions)
  .forTypescript(false)
  .useDefaults()
  .with(config => console.log(`Going to Start env: ${config.nodeEnv}`))
  .use(() => async (ctx, next) => {
    ctx.body = 'default body';
    await next();
  })
  .use(() => async (ctx, next) => {
    ctx.request.headers.visitor = 'test-me';
    await next();
  })
  .useLogTracer('visitor')
  .routes('./examples/simple-example/routes.js')
  .withLogo('./examples/simple-example/logo.txt');

if (!module.parent) {
  w.start();
}

module.exports = w;
