import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { cloneDeep } from 'lodash';

describe('Redis connection', function() {
  const config = {
    url: 'redis://localhost:6379/',
    options: {
      sample: 'sample',
      tls: {
        ca: [],
        cert: '',
        key: ''
      }
    }
  };
  let redis: any;
  let connectStub: ReturnType<typeof mock.fn>;
  let onStub: ReturnType<typeof mock.fn>;

  beforeEach(async function() {
    onStub = mock.fn();
    connectStub = mock.fn(() => ({ on: onStub }));
    delete require.cache[require.resolve('../../src/initializers/redis')];
    mock.module('redis', {
      namedExports: {
        createClient: connectStub
      }
    });
    ({ createRedisConnection: redis } = await import('../../src/initializers/redis'));
  });

  afterEach(function() {
    mock.restoreAll();
  });

  it('should connect to redis', () => {
    redis(config);
    const args = connectStub.mock.calls.map((c: any) => c.arguments);
    delete args[0][1].retry_strategy;
    assert.deepStrictEqual(args, [
      [
        'redis://localhost:6379/',
        {
          timesConnected: 10,
          totalRetryTime: 3600000,
          reconnectAfterMultiplier: 1000,
          socketKeepalive: true,
          socketInitialDelay: 60000,
          sample: 'sample'
        }
      ]
    ]);
  });

  it('should connect to redis with tls', () => {
    const newConfig = cloneDeep(config);
    newConfig.options.tls.key = 'key';
    redis(newConfig);
    const args = connectStub.mock.calls.map((c: any) => c.arguments);
    delete args[0][1].retry_strategy;
    assert.deepStrictEqual(args, [
      [
        'redis://localhost:6379/',
        {
          timesConnected: 10,
          totalRetryTime: 3600000,
          reconnectAfterMultiplier: 1000,
          socketKeepalive: true,
          socketInitialDelay: 60000,
          sample: 'sample',
          tls: {
            key: 'key'
          }
        }
      ]
    ]);
  });

  it('should connect to redis without options in config', () => {
    const newConfig = cloneDeep(config);
    delete (newConfig as any).options;
    redis(newConfig);
    const args = connectStub.mock.calls.map((c: any) => c.arguments);
    delete args[0][1].retry_strategy;
    assert.deepStrictEqual(args, [
      [
        'redis://localhost:6379/',
        {
          timesConnected: 10,
          totalRetryTime: 3600000,
          reconnectAfterMultiplier: 1000,
          socketKeepalive: true,
          socketInitialDelay: 60000
        }
      ]
    ]);
  });

  it('should not connect to redis', () => {
    redis({});
    assert.deepStrictEqual(connectStub.mock.calls.map((c: any) => c.arguments), []);
  });

  describe('retry_strategy', () => {
    it('returns server refused error', () => {
      redis(config);
      const args = connectStub.mock.calls[0].arguments as any[];
      const result = args[1].retry_strategy({ error: { code: 'ECONNREFUSED' } });
      assert.deepStrictEqual(result, new Error('The server refused the connection'));
    });

    it('returns retry time exhausted error', () => {
      redis(config);
      const args = connectStub.mock.calls[0].arguments as any[];
      const result = args[1].retry_strategy({ total_retry_time: 1000 * 60 * 60 + 1 });
      assert.deepStrictEqual(result, new Error('Retry time exhausted'));
    });

    it('throws error after 10 times connected - server will restart after that', () => {
      redis(config);
      const args = connectStub.mock.calls[0].arguments as any[];
      assert.throws(() => args[1].retry_strategy({ times_connected: 11 }));
    });

    it('returns ms to retry connection', function() {
      redis(config);
      const args = connectStub.mock.calls[0].arguments as any[];
      assert.strictEqual(args[1].retry_strategy({ attempt: 2 }), 4000);
    });
  });
});
