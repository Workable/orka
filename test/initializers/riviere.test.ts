import * as riviere from '@workablehr/riviere';
import * as log4js from 'log4js';
import * as sinon from 'sinon';

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
        'You are using a string for regex key headersRegex in riviere config. This will not supported after Orka v5.x.x. Please use a RegExp object.'
      );
      loggerStub.args[1][0].should.equal(
        'You are using a string for regex key bodyKeysRegex in riviere config. This will not supported after Orka v5.x.x. Please use a RegExp object.'
      );

      loggerStub.args[2][0].should.equal(
        'You are using a string for regex key outbound.blacklistedPathRegex in riviere config. This will not supported after Orka v5.x.x. Please use a RegExp object.'
      );
    });
  });
});
