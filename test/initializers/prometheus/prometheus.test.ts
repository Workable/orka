import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import nock from 'nock';
import Prometheus from '../../../src/initializers/prometheus/prometheus';
import { assertThrows } from '../../helpers/assert-helpers';

describe('prometheus class', () => {
  const appName = 'my_app';
  let instance: Prometheus | null;
  afterEach(() => {
    instance = null;
    mock.restoreAll();
  });

  beforeEach(async () => {
    instance = await makeInstance(appName);
  });

  describe('#contentType', () => {
    it('should return the content type for the exported data', () => {
      assert.strictEqual(instance!.contentType, 'text/plain; version=0.0.4; charset=utf-8');
    });
  });

  describe('#metrics', () => {
    it('should returns metrics as string', () => {
      const counterName = 'counter';
      const gaugeName = 'gauge';
      const counter = instance!.registerCounter('custom', counterName, `${counterName} help`);
      const gauge = instance!.registerGauge('external', gaugeName, `${gaugeName} help`, ['label']);
      counter.inc(1);
      counter.inc(10);
      gauge.set({ label: 'one' }, 100);
      gauge.set({ label: 'two' }, 200);
      const expected = `# HELP custom_my_app_counter counter help
      # TYPE custom_my_app_counter counter
      custom_my_app_counter 11

      # HELP external_my_app_gauge gauge help
      # TYPE external_my_app_gauge gauge
      external_my_app_gauge{label="one"} 100
      external_my_app_gauge{label="two"} 200
      `.replace(/[ ]{2,}/g, '');
      assert.strictEqual(instance!.metrics(), expected);
    });
  });

  describe('#registerCounter', () => {
    it('should return a Counter metric', () => {
      const name = 'My Counter';
      const counter = instance!.registerCounter('custom', name, 'my counter help', ['foo', 'bar']);
      assert.ok(counter !== undefined);
      assert.strictEqual((counter as any)['name'], 'custom_my_app_my_counter');
      assert.strictEqual(typeof counter.inc, 'function');
      assert.deepStrictEqual((counter as any)['labelNames'], ['foo', 'bar']);
      assert.strictEqual(instance!.getMetric('custom', name), counter);
    });
    it('should throw error if already registered', () => {
      const name = 'my_metric';
      instance!.registerCounter('custom', name, name);
      assertThrows(
        () => instance!.registerCounter('custom', name, name),
        'Metric custom_my_app_my_metric is already registered'
      );
    });
  });
  describe('#registerGauge', () => {
    it('should return a Gauge metric', () => {
      const name = 'my-gauge';
      const gauge = instance!.registerGauge('custom', name, 'my gauge help', ['foo', 'bar']);
      assert.ok(gauge !== undefined);
      assert.strictEqual((gauge as any)['name'], 'custom_my_app_my_gauge');
      assert.strictEqual(typeof gauge.set, 'function');
      assert.deepStrictEqual((gauge as any)['labelNames'], ['foo', 'bar']);
      assert.strictEqual(instance!.getMetric('custom', name), gauge);
    });
    it('should throw error if already registered', () => {
      const name = 'my_metric';
      instance!.registerGauge('custom', name, name);
      assertThrows(
        () => instance!.registerGauge('custom', name, name),
        'Metric custom_my_app_my_gauge is already registered'
      );
    });
  });

  describe('#registerHistogram', () => {
    it('should return a Histogram metric', () => {
      const name = 'my-histogram';
      const histogram = instance!.registerHistogram('custom', name, 'my gauge help', ['foo', 'bar']);
      assert.ok(histogram !== undefined);
      assert.strictEqual((histogram as any)['name'], 'custom_my_app_my_histogram');
      assert.strictEqual(typeof histogram.observe, 'function');
      assert.deepStrictEqual((histogram as any)['labelNames'], ['foo', 'bar']);
      assert.strictEqual(instance!.getMetric('custom', name), histogram);
    });

    it('should throw error if already registered', () => {
      const name = 'my_metric';
      instance!.registerHistogram('custom', name, name, ['foo', 'bar']);
      assert.throws(() => instance!.registerHistogram('custom', name, name, ['foo', 'bar']), {
        name: 'Error',
        message: 'Metric my_metric is already registered'
      });
    });
  });

  describe('#registerSummary', () => {
    it('should return a Summary metric', () => {
      const name = 'my-summary';
      const summary = instance!.registerSummary('custom', name, 'my gauge help', ['foo', 'bar']);
      assert.ok(summary !== undefined);
      assert.strictEqual((summary as any)['name'], 'custom_my_app_my_summary');
      assert.strictEqual(typeof summary.observe, 'function');
      assert.deepStrictEqual((summary as any)['labelNames'], ['foo', 'bar']);
      assert.strictEqual(instance!.getMetric('custom', name), summary);
    });

    it('should throw error if already registered', () => {
      const name = 'my_metric';
      instance!.registerSummary('custom', name, name, ['foo', 'bar']);
      assert.throws(() => instance!.registerSummary('custom', name, name, ['foo', 'bar']), {
        name: 'Error',
        message: 'Metric my_metric is already registered'
      });
    });
  });

  describe('#push', () => {
    describe('when no gateway url is provided', () => {
      it('should be rejected with an error', async () => {
        await assert.rejects(instance!.push(), /Pushgateway not configured/);
      });
    });
    describe('when gateway url is provided', () => {
      const gatewayUrl = 'http://push.gateway.local';
      let gatewayMock: any;
      beforeEach(async () => {
        instance = await makeInstance(appName, gatewayUrl);
        gatewayMock = nock(gatewayUrl);
      });
      afterEach(() => {
        nock.cleanAll();
      });
      it('should push metrics to gateway', async () => {
        gatewayMock.put(`/metrics/job/${appName}`).reply(200);
        await instance!.push();
        assert.strictEqual(gatewayMock.isDone(), true);
      });
      describe('when gateway returns error', () => {
        it('should be rejected with error from gateway', async () => {
          gatewayMock.put(`/metrics/job/${appName}`).replyWithError('Oops!');
          await assert.rejects(instance!.push(), /Oops!/);
          assert.strictEqual(gatewayMock.isDone(), true);
        });
      });
    });
  });
});

async function makeInstance(prefix: string, gatewayUrl: string | null = null) {
  return new Prometheus(prefix, { gatewayUrl });
}
