import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { getLogger } from '../../../src/initializers/log4js';
import init, { getPrometheus } from '../../../src/initializers/prometheus/index';

describe('prometheus init', () => {
  const appName = 'My Test App';

  afterEach(() => {
    mock.restoreAll();
  });

  describe('when configuration is missing', () => {
    it('should return undefined and log error', async () => {
      const logger = getLogger('orka.initializers.prometheus');
      const logSpy = mock.method(logger, 'error', logger.error);
      await init({} as any, appName);
      assert.strictEqual(getPrometheus(), undefined);
      assert.strictEqual(logSpy.mock.calls.length, 1);
      assert.strictEqual(logSpy.mock.calls[0].arguments[0].message, 'prometheus is not initialized');
    });
  });
  describe('when enabled', () => {
    const config = {
      prometheus: {
        enabled: true
      }
    };
    it('should return a prometheus instance without gateway', async () => {
      await init(config, appName);
      const prom = getPrometheus();
      assert.ok(prom !== undefined);
      assert.strictEqual((prom as any)['appName'], 'my_test_app');
      assert.strictEqual((prom as any)['gateway'], undefined);
    });
  });
  describe('when enabled with pushgateway', () => {
    const configWithGateway = {
      prometheus: {
        enabled: true,
        gatewayUrl: 'http://somehost.local'
      }
    };
    it('should return a prometheus instance with gateway', async () => {
      await init(configWithGateway, appName);
      const prom = getPrometheus();
      assert.ok(prom !== undefined);
      assert.ok((prom as any)['gateway'] !== undefined);
      assert.strictEqual((prom as any)['appName'], 'my_test_app');
      assert.strictEqual((prom as any)['gateway']['gatewayUrl'], 'http://somehost.local');
    });
  });
});
