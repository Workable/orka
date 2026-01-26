import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { default as logMetrics } from '../../src/helpers/log-metrics';
import * as log4js from 'log4js';
import * as newrelic from '../../src/initializers/newrelic';
import OrkaBuilder from '../../src/orka-builder';
import { assertContainsDeep } from './assert-helpers';

describe('Test log-metrics helper', function () {
  describe('Test start', function () {
    it('should return start as bigint', function () {
      const start = logMetrics.start();
      const s = Number(start) / 1e9;
      assert.strictEqual(typeof s, 'number');
    });
  });

  describe('Test end', function () {
    let observeSpy: ReturnType<typeof mock.fn>;
    let recordMetricSpy: ReturnType<typeof mock.fn>;
    let loggerStub: ReturnType<typeof mock.method>;

    beforeEach(function () {
      loggerStub = mock.method(log4js.getLogger('orka.errorHandler').constructor.prototype, 'debug');

      observeSpy = mock.fn();
      mock.method(logMetrics, 'prometheusEndClient', () => ({
        observe: observeSpy
      }) as any);

      recordMetricSpy = mock.fn();
      mock.method(newrelic, 'getNewRelic', () => ({
        recordMetric: recordMetricSpy
      }) as any);
    });

    afterEach(function () {
      mock.restoreAll();
    });

    describe('when prometheus/newrelic are enabled', function () {
      it('should log info and send to newRelic and prometheus', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: true, timeSummary: { enabled: true } } } } as any;
        process.env.NEW_RELIC_LICENSE_KEY = 'foo';

        const start = logMetrics.start();
        logMetrics.end(start, 'name', 'type', 'corID');

        assert.strictEqual(loggerStub.mock.callCount(), 1);
        assert.ok((loggerStub.mock.calls[0].arguments[0] as string).includes('[corID] TIME_LOGGING[type][name]'));
        assert.strictEqual(recordMetricSpy.mock.callCount(), 1);
        assert.strictEqual(recordMetricSpy.mock.calls[0].arguments[0], 'Custom/type/name');
        assert.strictEqual(observeSpy.mock.callCount(), 1);
        assertContainsDeep(observeSpy.mock.calls[0].arguments[0], { flow: 'name', flowType: 'type' });

        delete process.env.NEW_RELIC_LICENSE_KEY;
      });
    });

    describe('when prometheus/newrelic are not enabled for time logging', function () {
      it('should log info', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: true } } } as any;

        const start = logMetrics.start();
        logMetrics.end(start, 'name', 'type', 'corID');

        assert.strictEqual(recordMetricSpy.mock.callCount(), 0);
        assert.strictEqual(observeSpy.mock.callCount(), 0);
        assert.strictEqual(loggerStub.mock.callCount() > 0, true);
        assert.ok((loggerStub.mock.calls[0].arguments[0] as string).includes('[corID] TIME_LOGGING[type][name]'));
      });
    });
  });

  describe('Test recordMetric', function () {
    let observeSpy: ReturnType<typeof mock.fn>;
    let recordMetricSpy: ReturnType<typeof mock.fn>;
    let loggerStub: ReturnType<typeof mock.method>;

    beforeEach(function () {
      loggerStub = mock.method(log4js.getLogger('orka.errorHandler').constructor.prototype, 'debug');

      observeSpy = mock.fn();
      mock.method(logMetrics, 'prometheusRecordMetricsClient', () => ({
        observe: observeSpy
      }) as any);

      recordMetricSpy = mock.fn();
      mock.method(newrelic, 'getNewRelic', () => ({
        recordMetric: recordMetricSpy
      }) as any);
    });

    afterEach(function () {
      mock.restoreAll();
    });

    describe('when prometheus/newrelic are enabled', function () {
      it('should log debug and send to newRelic and prometheus', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: true, eventSummary: { enabled: true } } } } as any;
        process.env.NEW_RELIC_LICENSE_KEY = 'foo';

        logMetrics.recordMetric('test', 'type', 1);

        assert.strictEqual(recordMetricSpy.mock.callCount() > 0, true);
        assert.strictEqual(recordMetricSpy.mock.calls[0].arguments[0], 'Custom/type/test');
        assert.strictEqual(recordMetricSpy.mock.calls[0].arguments[1], 1);
        assert.strictEqual(loggerStub.mock.callCount(), 1);
        assert.strictEqual(loggerStub.mock.calls[0].arguments[0], '[type][test]: 1');
        assertContainsDeep(observeSpy.mock.calls[0].arguments, [{ event: 'test', eventType: 'type' }, 1]);

        delete process.env.NEW_RELIC_LICENSE_KEY;
      });
    });

    describe('when prometheus/newrelic are not enabled', function () {
      it('should log debug', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: false } } } as any;

        logMetrics.recordMetric('test', 'type', 1);

        assert.strictEqual(recordMetricSpy.mock.callCount(), 0);
        assert.strictEqual(observeSpy.mock.callCount(), 0);
        assert.strictEqual(loggerStub.mock.callCount() > 0, true);
        assert.strictEqual(loggerStub.mock.calls[0].arguments[0], '[type][test]: 1');
      });
    });
  });
});
