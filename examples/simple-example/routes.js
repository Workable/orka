const { getLogger } = require('../../build');

module.exports = {
  get: {
    '/test': async (ctx, next) => (ctx.body = 'ok'),
    '/testPolicy': async (ctx, next) => (ctx.body = 'ok'),
    '/log': async (ctx, next) => {
      getLogger('log').info('%s world', 'hello', { context: 'foo' });
      ctx.body = 'logged';
    },
    '/logError': async (ctx, next) => {
      getLogger('log').error(new Error('test'), 'this was a test error', { context: 'foo' });
      ctx.throw(new Error('test'), 505);
    },
    '/logCircular': async (ctx, next) => {
      var context = {
        bits: 4096,
        exponent: '0x10001',
        ext_key_usage: ['1.3.6.1.5.5.7.3.1', '1.3.6.1.5.5.7.3.2'],
        fingerprint: 'A5:6A:45:0C:F7:2E:0E:19:90:C5:C7:80:FE:74:48:52:B4:90:3A:C3',
        fingerprint256:
          '3F:E6:48:85:36:FE:09:94:63:AF:2D:EC:FB:B3:15:AF:42:B2:84:3C:C9:1D:40:EA:53:45:75:F0:F8:65:8E:4D',
        issuer: { C: 'US', O: "Let's Encrypt", CN: "Let's Encrypt Authority X3" },
        issuerCertificate: {},
        modulus: 'C08EE77530CBEA07A31FD2BD44E6C9C',
        serialNumber: '03B38D65C2F65BF692E5C2918F58E2835AF2',
        valid_from: 'Sep 13 07:53:05 2019 GMT',
        valid_to: 'Dec 12 07:53:05 2019 GMT'
      };
      context.issuerCertificate = context;
      context.issuerCertificate.issuerCertificate = context;

      getLogger('log').info('%s world', 'hello', { context });
      ctx.body = 'logged';
    }
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
