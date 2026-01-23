import * as riviere from '@workablehr/riviere';
import * as log4js from 'log4js';
import * as sinon from 'sinon';
import * as https from 'https';

const sandbox = sinon.createSandbox();

describe('riviere', () => {
  let orkaOptions;
  let riviereStub;
  let orkaRiviereInitializer;

  beforeEach(async function () {
    delete require.cache[require.resolve('../../src/initializers/riviere')];
    orkaRiviereInitializer = await import('../../src/initializers/riviere');

    orkaOptions = {
      riviereContext: () => ({})
    };
    sandbox.restore();

    riviereStub = sandbox.spy(riviere, 'riviere');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should keep regex flags from config', () => {
    const config = {
      riviere: {
        enabled: true,
        outbound: {
          enabled: true,
          blacklistedPathRegex: /some-regex/gim,
          request: {
            enabled: true
          }
        },
        headersRegex: /some-regex/gi,
        bodyKeysRegex: /some-regex/m,
        inbound: {
          request: {
            enabled: true
          }
        }
      }
    };

    orkaRiviereInitializer.default(config, orkaOptions);
    riviereStub.args[0][0].headersRegex.should.eql(/some-regex/gi);
    riviereStub.args[0][0].bodyKeysRegex.should.eql(/some-regex/m);
    riviereStub.args[0][0].outbound.blacklistedPathRegex.should.eql(/some-regex/gim);
  });

  context('when using strings in config', () => {
    it('should log warning and convert them to RegExp objects', () => {
      const loggerStub = sandbox.stub(log4js.getLogger('orka.riviere').constructor.prototype, 'warn');

      const config = {
        riviere: {
          enabled: true,
          outbound: {
            enabled: true,
            blacklistedPathRegex: '.*',
            request: {
              enabled: true
            }
          },
          headersRegex: '.*',
          bodyKeysRegex: '.*',
          inbound: {
            request: {
              enabled: true
            }
          }
        }
      };

      orkaRiviereInitializer.default(config, orkaOptions);

      riviereStub.args[0][0].headersRegex.should.eql(/.*/i);
      riviereStub.args[0][0].bodyKeysRegex.should.eql(/.*/i);
      riviereStub.args[0][0].outbound.blacklistedPathRegex.should.eql(/.*/i);

      loggerStub.callCount.should.equal(3);
      loggerStub.args[0][0].should.equal(
        'You are using a string for regex key headersRegex in riviere config. This will not be supported after Orka v5.x.x. Please use a RegExp object.'
      );
      loggerStub.args[1][0].should.equal(
        'You are using a string for regex key bodyKeysRegex in riviere config. This will not be supported after Orka v5.x.x. Please use a RegExp object.'
      );

      loggerStub.args[2][0].should.equal(
        'You are using a string for regex key outbound.blacklistedPathRegex in riviere config. This will not be supported after Orka v5.x.x. Please use a RegExp object.'
      );
    });
  });

  context('when proxying https.request', () => {
    let originalRequest;
    let errorLoggerStub;

    const baseConfig = {
      riviere: {
        enabled: true,
        outbound: {
          enabled: true,
          request: { enabled: true }
        },
        inbound: {
          request: { enabled: true }
        }
      },
      traceHeaderName: 'x-request-id'
    };

    beforeEach(() => {
      originalRequest = https.request;
      errorLoggerStub = sandbox.stub(log4js.getLogger('orka.riviere').constructor.prototype, 'error');
    });

    afterEach(() => {
      (https as any).request = originalRequest;
    });

    it('should handle URL string as first argument without error', () => {
      orkaRiviereInitializer.default(baseConfig, orkaOptions);

      const req = https.request('https://example.com/api/test', { method: 'GET' }, () => { /* noop */ });
      req.on('error', () => { /* expected - we're destroying the socket */ });
      req.destroy();

      const headerError = errorLoggerStub.args.find(
        args => args[0]?.message?.includes('Cannot create property')
      );
      (headerError === undefined).should.be.true();
    });

    it('should handle URL object as first argument without error', () => {
      orkaRiviereInitializer.default(baseConfig, orkaOptions);

      const req = https.request(new URL('https://example.com/api/test'), { method: 'GET' }, () => { /* noop */ });
      req.on('error', () => { /* expected - we're destroying the socket */ });
      req.destroy();

      const headerError = errorLoggerStub.args.find(
        args => args[0]?.message?.includes('Cannot create property')
      );
      (headerError === undefined).should.be.true();
    });

    it('should handle options object as first argument (original behavior)', () => {
      orkaRiviereInitializer.default(baseConfig, orkaOptions);

      const req = https.request({ hostname: 'example.com', path: '/api/test', method: 'GET' }, () => { /* noop */ });
      req.on('error', () => { /* expected - we're destroying the socket */ });
      req.destroy();

      const headerError = errorLoggerStub.args.find(
        args => args[0]?.message?.includes('Cannot create property')
      );
      (headerError === undefined).should.be.true();
    });
  });
});
