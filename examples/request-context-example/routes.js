const { getLogger, getRequestContext } = require('../../build');
const { testMe, postFoo, get } = require('./service');

module.exports = {
  get: {
    '/log': async ctx => {
      getLogger('log').info('A log in controller, before service call');
      await testMe();
      getLogger('log').info('A log in controller, after service call');
      ctx.body = 'ok';
      ctx.status = 200;
    },
    '/logWithAppendedRequestContextVar': async (ctx, next) => {
      await testMe();
      ctx.body = 'ok';
      ctx.status = 200;
    },
    '/first': async ctx => {
      ctx.body = await get('second');
    },
    '/second': async ctx => {
      ctx.body = await get('third');
    },
    '/third': async ctx => {
      ctx.body = ctx.headers;
    }
  },

  post: {
    '/propagateTracingHeaders': async ctx => {
      await postFoo('foo');
      ctx.body = 'ok';
      ctx.status = 200;
    }
  },
  prefix: {
    '/logWithAppendedRequestContextVar': async (ctx, next) => {
      const store = getRequestContext();
      if (store && ctx.query.q) {
        store.set('query', ctx.query.q);
      }
      await next();
    }
  }
};
