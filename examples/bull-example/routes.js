const { startAll } = require('../../build');

module.exports = {
  get: {
    '/init': async (ctx, next) => {
      await startAll();
    },
  },
};
