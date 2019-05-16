module.exports = {
  get: {
    '/test': async (ctx, next) => (ctx.body = 'ok')
  }
};
