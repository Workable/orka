module.exports = {
  get: {
    '/test': async (ctx, next) => (ctx.body = 'ok'),
    '/testPolicy': async (ctx, next) => (ctx.body = 'ok')
  },
  policy: {
    '/testPolicy': async (ctx, next) => {
      if (ctx.request.query.secret_key === 'success') {
        return await next();
      }
      throw { status: 401, message: 'Unauthorized' };
    }
  },
  prefix: {
    '/test': async (ctx, next) => {
      await next();
      ctx.body = ctx.body + ' changed by prefix';
    }
  }
};
