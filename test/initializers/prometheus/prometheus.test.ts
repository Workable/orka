import should = require('should');
// const mock = require('mock-require');
import * as sinon from 'sinon';
import * as nock from 'nock';
import Prometheus from '../../../src/initializers/prometheus/prometheus';
import assert = require('assert');

const sandbox = sinon.createSandbox();

describe('prometheus class', () => {
  const appName = 'my_app';
  let instance: Prometheus;
  afterEach(() => {
    instance = null;
    sandbox.restore();
  });

  beforeEach(async () => {
    instance = await makeInstance(appName);
  });

  describe('#contentType', () => {
    it('should return the content type for the exported data', () => {
      should(instance.contentType).be.equal('text/plain; version=0.0.4; charset=utf-8');
    });
  });

  describe('#metrics', () => {
    it('should returns metrics as string', () => {
      const counterName = 'counter';
      const gaugeName = 'gauge';
      const counter = instance.registerCounter('custom', counterName, `${counterName} help`);
      const gauge = instance.registerGauge('external', gaugeName, `${gaugeName} help`, ['label']);
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
      should(instance.metrics()).be.equal(expected);
    });
  });

  describe('#registerCounter', () => {
    it('should return a Counter metric', () => {
      const name = 'My Counter';
      const counter = instance.registerCounter('custom', name, 'my counter help', ['foo', 'bar']);
      should(counter).not.be.undefined();
      should(counter['name']).be.equal('custom_my_app_my_counter');
      should(counter.inc).be.Function();
      should(counter['labelNames']).be.eql(['foo', 'bar']);
      instance.getMetric('custom', name).should.be.equal(counter);
    });
    it('should throw error if already registered', () => {
      const name = 'my_metric';
      instance.registerCounter('custom', name, name);
      should.throws(
        () => instance.registerCounter('custom', name, name),
        'Metric custom_my_app_my_metric is already registered'
      );
    });
  });
  describe('#registerGauge', () => {
    it('should return a Gauge metric', () => {
      const name = 'my-gauge';
      const gauge = instance.registerGauge('custom', name, 'my gauge help', ['foo', 'bar']);
      should(gauge).not.be.undefined();
      should(gauge['name']).be.equal('custom_my_app_my_gauge');
      should(gauge.set).be.Function();
      should(gauge['labelNames']).be.eql(['foo', 'bar']);
      instance.getMetric('custom', name).should.be.equal(gauge);
    });
    it('should throw error if already registered', () => {
      const name = 'my_metric';
      instance.registerGauge('custom', name, name);
      should.throws(
        () => instance.registerGauge('custom', name, name),
        'Metric custom_my_app_my_gauge is already registered'
      );
    });
  });

  describe('#registerHistogram', () => {
    it('should return a Histogram metric', () => {
      const name = 'my-histogram';
      const histogram = instance.registerHistogram('custom', name, 'my gauge help', ['foo', 'bar']);
      should(histogram).not.be.undefined();
      should(histogram['name']).be.equal('custom_my_app_my_histogram');
      should(histogram.observe).be.Function();
      should(histogram['labelNames']).be.eql(['foo', 'bar']);
      instance.getMetric('custom', name).should.be.equal(histogram);
    });

    it('should throw error if already registered', () => {
      const name = 'my_metric';
      instance.registerHistogram('custom', name, name, ['foo', 'bar']);
      assert.throws(() => instance.registerHistogram('custom', name, name, ['foo', 'bar']), {
        name: 'Error',
        message: 'Metric my_metric is already registered'
      });
    });
  });

  describe('#registerSummary', () => {
    it('should return a Summary metric', () => {
      const name = 'my-summary';
      const summary = instance.registerSummary('custom', name, 'my gauge help', ['foo', 'bar']);
      should(summary).not.be.undefined();
      should(summary['name']).be.equal('custom_my_app_my_summary');
      should(summary.observe).be.Function();
      should(summary['labelNames']).be.eql(['foo', 'bar']);
      instance.getMetric('custom', name).should.be.equal(summary);
    });

    it('should throw error if already registered', () => {
      const name = 'my_metric';
      instance.registerSummary('custom', name, name, ['foo', 'bar']);
      assert.throws(() => instance.registerSummary('custom', name, name, ['foo', 'bar']), {
        name: 'Error',
        message: 'Metric my_metric is already registered'
      });
    });
  });

  describe('#push', () => {
    describe('when no gateway url is provided', () => {
      it('should be rejected with an error', () => {
        return instance.push().should.be.rejectedWith('Pushgateway not configured');
      });
    });
    describe('when gateway url is provided', () => {
      const gatewayUrl = 'http://push.gateway.local';
      let gatewayMock;
      beforeEach(async () => {
        instance = await makeInstance(appName, gatewayUrl);
        gatewayMock = nock(gatewayUrl);
      });
      afterEach(() => {
        nock.cleanAll();
      });
      it('should push metrics to gateway', () => {
        gatewayMock.put(`/metrics/job/${appName}`).reply(200);
        return instance
          .push()
          .should.be.fulfilled()
          .then(() => {
            gatewayMock.isDone().should.be.true();
          });
      });
      describe('when gateway returns error', () => {
        it('should be rejected with error from gateway', () => {
          gatewayMock.put(`/metrics/job/${appName}`).replyWithError('Oops!');
          return instance
            .push()
            .should.be.rejectedWith('Oops!')
            .then(() => {
              gatewayMock.isDone().should.be.true();
            });
        });
      });
    });
  });
});

async function makeInstance(prefix, gatewayUrl = null) {
  return new Prometheus(prefix, { gatewayUrl });
}
