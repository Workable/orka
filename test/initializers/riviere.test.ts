import * as riviere from '@workablehr/riviere';
import * as sinon from 'sinon';
import orkaRiviereInitializer from '../../src/initializers/riviere';

const sandbox = sinon.createSandbox();

describe('riviere', () => {
  let orkaOptions;
  let riviereStub;

  beforeEach(() => {
    orkaOptions = {
      riviereContext: () => ({})
    };

    riviereStub = sandbox.stub(riviere, 'riviere').returns({});
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should respect regex flags from config', () => {
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
        inbound: {
          request: {
            enabled: true
          }
        }
      }
    };

    orkaRiviereInitializer(config, orkaOptions);
    riviereStub.args[0][0].headersRegex.should.eql(/some-regex/gi);
    riviereStub.args[0][0].outbound.blacklistedPathRegex.should.eql(/some-regex/gim);
  });
});
