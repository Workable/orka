import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';

describe('Test postgres connection', function () {
  const config = {
    postgres: {
      url: 'postgres://localhost'
    }
  };
  let postgres: any;
  let poolStub: ReturnType<typeof mock.fn>;

  beforeEach(async function () {
    poolStub = mock.fn(() => ({ on: mock.fn() }));
    delete require.cache[require.resolve('../../src/initializers/postgres')];
    mock.module('pg', {
      namedExports: {
        Pool: poolStub
      }
    });
    ({ default: postgres } = await import('../../src/initializers/postgres'));
  });

  afterEach(function () {
    mock.restoreAll();
  });

  it('should connect to postgres', () => {
    postgres(config);
    assert.strictEqual(poolStub.mock.callCount(), 1);
  });

  it('should not connect to postgres with no config', () => {
    postgres({});
    assert.strictEqual(poolStub.mock.callCount(), 0);
  });

  it('should use ssl to connect to postgres', () => {
    postgres({
      postgres: {
        url: 'postgres://localhost',
        useSsl: true,
        sslConfig: {
          rejectUnauthorized: false
        }
      }
    });
    assert.deepStrictEqual(poolStub.mock.calls.map((c: any) => c.arguments), [
      [
        {
          connectionString: 'postgres://localhost',
          max: undefined,
          ssl: { rejectUnauthorized: false },
          idleTimeoutMillis: undefined,
          connectionTimeoutMillis: undefined,
          statement_timeout: undefined,
          query_timeout: undefined,
        }
      ]
    ]);
  });

  it('should not use ssl to connect to postgres', () => {
    postgres({
      postgres: {
        url: 'postgres://localhost',
        useSsl: false,
        sslConfig: {
          rejectUnauthorized: false,
          ca: '',
          cert: '',
          key: ''
        },
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 0,
        statementTimeout: 3000,
        queryTimeout: 5000
      }
    });
    assert.deepStrictEqual(poolStub.mock.calls.map((c: any) => c.arguments), [
      [
        {
          connectionString: 'postgres://localhost',
          max: undefined,
          ssl: undefined,
          idleTimeoutMillis: 10000,
          connectionTimeoutMillis: 0,
          statement_timeout: 3000,
          query_timeout: 5000,
        }
      ]
    ]);
  });

  it('should use ssl and ca,cert, key to connect to postgres', () => {
    postgres({
      postgres: {
        url: 'postgres://localhost',
        useSsl: true,
        sslConfig: {
          rejectUnauthorized: true,
          ca: 'ca',
          cert: 'cert',
          key: 'key'
        },
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 0
      }
    });
    assert.deepStrictEqual(poolStub.mock.calls.map((c: any) => c.arguments), [
      [
        {
          connectionString: 'postgres://localhost',
          max: undefined,
          ssl: {
            rejectUnauthorized: true,
            ca: 'ca',
            cert: 'cert',
            key: 'key'
          },
          idleTimeoutMillis: 10000,
          connectionTimeoutMillis: 0,
          statement_timeout: undefined,
          query_timeout: undefined,
        }
      ]
    ]);
  });
});
