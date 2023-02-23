import { default as logMetrics } from '../../src/helpers/log-metrics';
import * as log4js from 'log4js';
import * as newrelic from '../../src/initializers/newrelic';
import * as sinon from 'sinon';
import OrkaBuilder from '../../src/orka-builder';

const sandbox = sinon.createSandbox();

describe('Test log-metrics helper', function () {
  describe('Test start', function () {
    it('should return start as bigint', function () {
      const start = logMetrics.start();
      const s = Number(start) / 1e9;
      s.should.be.a.Number();
    });
  });

  describe('Test end', function () {
    let observeSpy;
    let recordMetricSpy;
    let loggerDebugStub;
    let loggerTraceStub;
    beforeEach(function () {
      loggerDebugStub = sandbox.stub(log4js.getLogger('orka.errorHandler').constructor.prototype, 'debug');
      loggerTraceStub = sandbox.stub(log4js.getLogger('orka.errorHandler').constructor.prototype, 'trace');

      observeSpy = sandbox.stub();
      sandbox.stub(logMetrics, 'prometheusEndClient').returns({
        observe: observeSpy
      } as any);

      recordMetricSpy = sandbox.stub();
      sandbox.stub(newrelic, 'getNewRelic').returns({
        recordMetric: recordMetricSpy
      } as any);
    });

    afterEach(function () {
      sandbox.restore();
    });

    context('when prometheus/newrelic are enabled', function () {
      it('should log info and send to newRelic and prometheus', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: true, timeSummary: { enabled: true } } } } as any;
        process.env.NEW_RELIC_LICENSE_KEY = 'foo';

        const start = logMetrics.start();
        logMetrics.end(start, 'name', 'type', 'corID');

        loggerDebugStub.calledOnce.should.be.true();
        loggerDebugStub.args[0][0].should.containEql('[corID] TIME_LOGGING[type][name]');
        recordMetricSpy.calledOnce.should.be.true();
        recordMetricSpy.args[0][0].should.eql('Custom/type/name');
        observeSpy.calledOnce.should.be.true();
        observeSpy.args[0].should.containDeep([{ flow: 'name', flowType: 'type' }]);

        delete process.env.NEW_RELIC_LICENSE_KEY;
      });

      it('should not log debug and send to newRelic and prometheus if enableLog: false', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: true, timeSummary: { enabled: true } } } } as any;
        process.env.NEW_RELIC_LICENSE_KEY = 'foo';

        const start = logMetrics.start();
        logMetrics.end(start, 'name', 'type', 'corID', false);

        loggerDebugStub.calledOnce.should.be.false();
        loggerTraceStub.calledOnce.should.be.true();
        loggerTraceStub.args[0][0].should.containEql('[corID] TIME_LOGGING[type][name]');
        recordMetricSpy.calledOnce.should.be.true();
        recordMetricSpy.args[0][0].should.eql('Custom/type/name');
        observeSpy.calledOnce.should.be.true();
        observeSpy.args[0].should.containDeep([{ flow: 'name', flowType: 'type' }]);

        delete process.env.NEW_RELIC_LICENSE_KEY;
      });
    });

    context('when prometheus/newrelic are not enabled for time logging', function () {
      it('should log debug', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: true } } } as any;

        const start = logMetrics.start();
        logMetrics.end(start, 'name', 'type', 'corID');

        recordMetricSpy.called.should.be.false();
        observeSpy.called.should.be.false();
        loggerDebugStub.called.should.be.true();
        loggerDebugStub.args[0][0].should.containEql('[corID] TIME_LOGGING[type][name]');
      });

      it('should log trace if enableLog: false', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: true } } } as any;

        const start = logMetrics.start();
        logMetrics.end(start, 'name', 'type', 'corID', false);

        recordMetricSpy.called.should.be.false();
        observeSpy.called.should.be.false();
        loggerDebugStub.called.should.be.false();
        loggerTraceStub.called.should.be.true();
        loggerTraceStub.args[0][0].should.containEql('[corID] TIME_LOGGING[type][name]');
      });
    });
  });

  describe('Test recordMetric', function () {
    let observeSpy;
    let recordMetricSpy;
    let loggerDebugStub;
    let loggerTraceStub;
    beforeEach(function () {
      loggerDebugStub = sandbox.stub(log4js.getLogger('orka.errorHandler').constructor.prototype, 'debug');
      loggerTraceStub = sandbox.stub(log4js.getLogger('orka.errorHandler').constructor.prototype, 'trace');

      observeSpy = sandbox.stub();
      sandbox.stub(logMetrics, 'prometheusRecordMetricsClient').returns({
        observe: observeSpy
      } as any);

      recordMetricSpy = sandbox.stub();
      sandbox.stub(newrelic, 'getNewRelic').returns({
        recordMetric: recordMetricSpy
      } as any);
    });

    afterEach(function () {
      sandbox.restore();
    });

    context('when prometheus/newrelic are enabled', function () {
      it('should log debug and send to newRelic and prometheus', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: true, eventSummary: { enabled: true } } } } as any;
        process.env.NEW_RELIC_LICENSE_KEY = 'foo';

        logMetrics.recordMetric('test', 'type', 1);

        recordMetricSpy.called.should.be.true();
        recordMetricSpy.calledWith('Custom/type/test', 1).should.be.true();
        loggerDebugStub.calledOnce.should.be.true();
        loggerDebugStub.calledWith('[type][test]: 1').should.be.true();
        observeSpy.args[0].should.containDeep([{ event: 'test', eventType: 'type' }, 1]);

        delete process.env.NEW_RELIC_LICENSE_KEY;
      });

      it('should not log debug and send to newRelic and prometheus if enableLog: false', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: true, eventSummary: { enabled: true } } } } as any;
        process.env.NEW_RELIC_LICENSE_KEY = 'foo';

        logMetrics.recordMetric('test', 'type', 1, false);

        recordMetricSpy.called.should.be.true();
        recordMetricSpy.calledWith('Custom/type/test', 1).should.be.true();
        loggerDebugStub.calledOnce.should.be.false();
        loggerTraceStub.calledOnce.should.be.true();
        loggerTraceStub.calledWith('[type][test]: 1').should.be.true();
        observeSpy.args[0].should.containDeep([{ event: 'test', eventType: 'type' }, 1]);

        delete process.env.NEW_RELIC_LICENSE_KEY;
      });
    });

    context('when prometheus/newrelic are not enabled', function () {
      it('should log debug', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: false } } } as any;

        logMetrics.recordMetric('test', 'type', 1);

        recordMetricSpy.called.should.be.false();
        observeSpy.called.should.be.false();
        loggerDebugStub.called.should.be.true();
        loggerDebugStub.calledWith('[type][test]: 1').should.be.true();
      });

      it('should not log debug if enableLog: false', function () {
        OrkaBuilder.INSTANCE = { config: { prometheus: { enabled: false } } } as any;

        logMetrics.recordMetric('test', 'type', 1, false);

        recordMetricSpy.called.should.be.false();
        observeSpy.called.should.be.false();
        loggerDebugStub.called.should.be.false();
        loggerTraceStub.called.should.be.true();
        loggerTraceStub.calledWith('[type][test]: 1').should.be.true();
      });
    });
  });
});
