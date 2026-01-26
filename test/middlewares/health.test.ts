import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { Context } from 'koa';
import OrkaBuilder from '../../src/orka-builder';

describe('Health middleware', function () {
  let mockContexts: any[] = [];

  afterEach(function () {
    // Restore all mock contexts
    mockContexts.forEach(ctx => {
      try { ctx.restore(); } catch { /* ignore */ }
    });
    mockContexts = [];
    mock.restoreAll();
  });

  async function setupMocks(mongoReadyState: number, rabbitHealthy: boolean, redisHealthy: boolean = true, kafkaHealthy: boolean = true) {
    // Clear caches for health.ts and its static dependencies
    delete require.cache[require.resolve('../../src/middlewares/health')];
    delete require.cache[require.resolve('../../src/initializers/rabbitmq')];
    delete require.cache[require.resolve('../../src/initializers/redis')];
    delete require.cache[require.resolve('../../src/initializers/kafka')];
    delete require.cache[require.resolve('../../src/initializers/mongodb')];

    mockContexts.push(mock.module('../../src/initializers/mongodb', {
      namedExports: {
        getConnection: () => ({ readyState: mongoReadyState })
      }
    }));

    mockContexts.push(mock.module('../../src/initializers/rabbitmq', {
      namedExports: {
        isHealthy: () => rabbitHealthy
      }
    }));

    mockContexts.push(mock.module('../../src/initializers/redis', {
      namedExports: {
        isHealthy: () => redisHealthy
      }
    }));

    mockContexts.push(mock.module('../../src/initializers/kafka', {
      namedExports: {
        isHealthy: () => kafkaHealthy
      }
    }));

    return (await import('../../src/middlewares/health')).default;
  }

  it('returns 200 when mongo connection is ok and rabbitmq is healthy', async function () {
    const health = await setupMocks(1, true);
    const version = process.env.npm_package_version;
    process.env.npm_package_version = '2.44.0';
    const ctx = {} as Context;
    OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { redis: false } } } as any;
    const next = mock.fn();
    await health(ctx, next);
    assert.strictEqual(ctx.status, 200);
    assert.strictEqual(ctx.body.version, 'v2.44.0');
    assert.strictEqual(ctx.body.env, 'test');
    assert.strictEqual(next.mock.callCount() > 0, true);
    process.env.npm_package_version = version;
  });

  it('returns 503 when mongo connection is down', async function () {
    const health = await setupMocks(2, true);
    const ctx = {} as Context;
    OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { redis: false } } } as any;
    const next = mock.fn();
    await health(ctx, next);
    assert.strictEqual(next.mock.callCount() > 0, true);
    assert.strictEqual(ctx.status, 503);
  });

  it('return 503 when rabbitmq is not healthy', async function () {
    const health = await setupMocks(1, false);
    const ctx = {} as Context;
    OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { redis: false } } } as any;
    const next = mock.fn();
    await health(ctx, next);
    assert.strictEqual(next.mock.callCount() > 0, true);
    assert.strictEqual(ctx.status, 503);
  });

  describe('when config.healthCheck.redis: true', () => {
    it('returns 200 when mongo connection is ok and rabbitmq is healthy and redis is healthy', async function () {
      const health = await setupMocks(1, true, true);
      const version = process.env.npm_package_version;
      process.env.npm_package_version = '2.44.0';
      const ctx = {} as Context;
      OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { redis: true } } } as any;
      const next = mock.fn();
      await health(ctx, next);
      assert.strictEqual(ctx.status, 200);
      assert.strictEqual(ctx.body.version, 'v2.44.0');
      assert.strictEqual(ctx.body.env, 'test');
      assert.strictEqual(next.mock.callCount() > 0, true);
      process.env.npm_package_version = version;
    });

    it('return 503 when redis is not healthy', async function () {
      const health = await setupMocks(1, true, false);
      const ctx = {} as Context;
      OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { redis: true } } } as any;
      const next = mock.fn();
      await health(ctx, next);
      assert.strictEqual(next.mock.callCount() > 0, true);
      assert.strictEqual(ctx.status, 503);
    });
  });

  describe('when config.healthCheck.kafka: true', () => {
    it('returns 200 when mongo connection is ok and rabbitmq is healthy and kafka is healthy', async function () {
      const health = await setupMocks(1, true, true, true);
      const version = process.env.npm_package_version;
      process.env.npm_package_version = '2.44.0';
      const ctx = {} as Context;
      OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { kafka: true } } } as any;
      const next = mock.fn();
      await health(ctx, next);
      assert.strictEqual(ctx.status, 200);
      assert.strictEqual(ctx.body.version, 'v2.44.0');
      assert.strictEqual(ctx.body.env, 'test');
      assert.strictEqual(next.mock.callCount() > 0, true);
      process.env.npm_package_version = version;
    });

    it('return 503 when kafka is not healthy', async function () {
      const health = await setupMocks(1, true, true, false);
      const ctx = {} as Context;
      OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { kafka: true } } } as any;
      const next = mock.fn();
      await health(ctx, next);
      assert.strictEqual(next.mock.callCount() > 0, true);
      assert.strictEqual(ctx.status, 503);
    });
  });
});
