const { orka } = require('../../build');

function init(afterMiddleware = () => [], errorHandler = (ctx, err) => (ctx.body = err), omitErrorKeys = []) {
  return orka({
    afterMiddleware,
    diamorphosis: { configFolder: './examples/simple-example' },
    routesPath: './examples/simple-example/routes.js',
    logoPath: './examples/simple-example/logo.txt',
    errorHandler,
    omitErrorKeys
  }).start();
}

if (!module.parent) {
  init();
}

module.exports = init;
