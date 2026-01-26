import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { Context } from 'koa';
import OrkaBuilder from '../../src/orka-builder';

describe('Metrics middleware', function () {
  describe('Prometheus enabled', function () {
    let metrics: any;
    let metricsSpy: ReturnType<typeof mock.fn>;
    let updateMetricsStub: ReturnType<typeof mock.fn>;

    beforeEach(async function () {
      metricsSpy = mock.fn(() => ({ metric: 1 }));
      updateMetricsStub = mock.fn();

      mock.module('../../src/index', {
        namedExports: {
          getPrometheus: () => ({ metrics: metricsSpy, contentType: 'text/plain' }),
          getBull: () => ({ updateMetrics: updateMetricsStub })
        }
      });

      delete require.cache[require.resolve('../../src/middlewares/metrics')];
      metrics = (await import('../../src/middlewares/metrics')).default;
    });

    afterEach(function () {
      mock.restoreAll();
    });

    it('returns 200 when no bull is configured', async function () {
      const ctx = {} as Context;
      OrkaBuilder.INSTANCE = { config: { bull: '' } } as any;
      metricsSpy.mock.mockImplementation(() => ({ metric: 1 }));
      const next = mock.fn();
      await metrics(ctx, next);
      assert.strictEqual(ctx.status, 200);
      assert.strictEqual(ctx.body.metric, 1);
      assert.strictEqual(next.mock.callCount() > 0, true);
      assert.strictEqual(updateMetricsStub.mock.callCount(), 0);
    });

    it('returns 200 even if metrics returns a promise', async function () {
      const ctx = {} as Context;
      OrkaBuilder.INSTANCE = { config: { bull: '' } } as any;
      metricsSpy.mock.mockImplementation(() => Promise.resolve({ metric: 1 }));
      const next = mock.fn();
      await metrics(ctx, next);
      assert.strictEqual(ctx.status, 200);
      assert.strictEqual(ctx.body.metric, 1);
      assert.strictEqual(next.mock.callCount() > 0, true);
      assert.strictEqual(updateMetricsStub.mock.callCount(), 0);
    });

    it('returns 200 and calls bull update when bull is configured', async function () {
      const ctx = {} as Context;
      OrkaBuilder.INSTANCE = { config: { bull: {} } } as any;
      metricsSpy.mock.mockImplementation(() => ({ metric: 1 }));
      updateMetricsStub.mock.mockImplementation(() => Promise.resolve());
      const next = mock.fn();
      await metrics(ctx, next);
      assert.strictEqual(ctx.status, 200);
      assert.strictEqual(ctx.body.metric, 1);
      assert.strictEqual(next.mock.callCount() > 0, true);
      assert.strictEqual(updateMetricsStub.mock.callCount() > 0, true);
    });
  });

  describe('Prometheus not configured', function () {
    let metrics: any;

    beforeEach(async function () {
      mock.module('../../src/index', {
        namedExports: {
          getPrometheus: () => undefined,
          getBull: () => undefined
        }
      });

      delete require.cache[require.resolve('../../src/middlewares/metrics')];
      metrics = (await import('../../src/middlewares/metrics')).default;
    });

    afterEach(function () {
      mock.restoreAll();
    });

    it('returns 404', async function () {
      const ctx = {} as Context;
      OrkaBuilder.INSTANCE = { config: { bull: {} } } as any;
      const next = mock.fn();
      await metrics(ctx, next);
      assert.strictEqual(ctx.status, 404);
      assert.strictEqual(next.mock.callCount() > 0, true);
    });
  });
});
