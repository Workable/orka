import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { getMockCallArgs } from '../helpers/assert-helpers';

describe('riviere', () => {
  let orkaOptions: any;
  let riviereStub: ReturnType<typeof mock.fn>;
  let orkaRiviereInitializer: any;
  let loggerWarnStub: ReturnType<typeof mock.fn>;

  beforeEach(async function () {
    riviereStub = mock.fn();
    loggerWarnStub = mock.fn();

    mock.module('@workablehr/riviere', {
      namedExports: {
        riviere: riviereStub
      }
    });

    mock.module('log4js', {
      namedExports: {
        getLogger: () => ({
          warn: loggerWarnStub,
          info: mock.fn(),
          error: mock.fn()
        })
      }
    });

    delete require.cache[require.resolve('../../src/initializers/riviere')];
    orkaRiviereInitializer = await import('../../src/initializers/riviere');

    orkaOptions = {
      riviereContext: () => ({})
    };
  });

  afterEach(() => {
    mock.restoreAll();
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
    assert.deepStrictEqual(getMockCallArgs(riviereStub)[0][0].headersRegex, /some-regex/gi);
    assert.deepStrictEqual(getMockCallArgs(riviereStub)[0][0].bodyKeysRegex, /some-regex/m);
    assert.deepStrictEqual(getMockCallArgs(riviereStub)[0][0].outbound.blacklistedPathRegex, /some-regex/gim);
  });

  describe('when using strings in config', () => {
    it('should log warning and convert them to RegExp objects', () => {
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

      assert.deepStrictEqual(getMockCallArgs(riviereStub)[0][0].headersRegex, /.*/i);
      assert.deepStrictEqual(getMockCallArgs(riviereStub)[0][0].bodyKeysRegex, /.*/i);
      assert.deepStrictEqual(getMockCallArgs(riviereStub)[0][0].outbound.blacklistedPathRegex, /.*/i);

      assert.strictEqual(loggerWarnStub.mock.calls.length, 3);
      assert.strictEqual(
        getMockCallArgs(loggerWarnStub)[0][0],
        'You are using a string for regex key headersRegex in riviere config. This will not be supported after Orka v5.x.x. Please use a RegExp object.'
      );
      assert.strictEqual(
        getMockCallArgs(loggerWarnStub)[1][0],
        'You are using a string for regex key bodyKeysRegex in riviere config. This will not be supported after Orka v5.x.x. Please use a RegExp object.'
      );

      assert.strictEqual(
        getMockCallArgs(loggerWarnStub)[2][0],
        'You are using a string for regex key outbound.blacklistedPathRegex in riviere config. This will not be supported after Orka v5.x.x. Please use a RegExp object.'
      );
    });
  });
});
