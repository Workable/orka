const { getLogger } = require('../../build');
const axios = require('axios');

module.exports = {
  get: {
    '/test': async (ctx, next) => {
      await axios.get('http://localhost:7172/health');
      ctx.body = 'ok'
    },
    '/testPolicy': async (ctx, next) => (ctx.body = 'ok'),
    '/log': async (ctx, next) => {
      getLogger('log').info('%s world', 'hello', { context: 'foo' });
      ctx.body = 'logged';
    },
    '/logError': async (ctx, next) => {
      getLogger('log').error(new Error('test'), 'this was a test error', { context: 'foo' });
      ctx.throw(new Error('test'), 505);
    },
    '/api/allowAll/accounts/:subdomain': async (ctx, next) => (ctx.body = 'ok')
  },
  post: {
    '/test': async (ctx, next) => (ctx.body = 'ok')
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
