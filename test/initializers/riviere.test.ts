import * as riviere from '@workablehr/riviere';
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
});
