import should = require('should');
// const mock = require('mock-require');
import * as sinon from 'sinon';
import * as nock from 'nock';

const sandbox = sinon.createSandbox();

describe('prometheus class', () => {
  const prefix = 'prefix';
  let instance;
  afterEach(() => {
    instance = null;
    sandbox.restore();
  });

  beforeEach(async () => {
    instance = await makeInstance(prefix);
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
      const counter = instance.registerCounter(counterName, `${counterName} help`);
      const gauge = instance.registerGauge(gaugeName, `${gaugeName} help`, ['label']);
      counter.inc(1);
      counter.inc(10);
      gauge.set({ label: 'one' }, 100);
      gauge.set({ label: 'two' }, 200);
      const expected = `# HELP prefix_counter counter help
      # TYPE prefix_counter counter
      prefix_counter 11
      
      # HELP prefix_gauge gauge help
      # TYPE prefix_gauge gauge
      prefix_gauge{label="one"} 100
      prefix_gauge{label="two"} 200
      `.replace(/[ ]{2,}/g, '');
      should(instance.metrics()).be.equal(expected);
    });
  });

  describe('#registerCounter', () => {
    it('should return a Counter metric', () => {
      const name = 'My Counter';
      const counter = instance.registerCounter(name, 'my counter help', ['foo', 'bar']);
      should(counter).not.be.undefined();
      should(counter.name).be.equal('prefix_my_counter');
      should(counter.inc).be.Function();
      should(counter.labelNames).be.eql(['foo', 'bar']);
      instance.getMetric(name).should.be.equal(counter);
    });
    it('should throw error if already registered', () => {
      const name = 'my_metric';
      instance.registerCounter(name, name);
      should.throws(() => instance.registerCounter(name, name), 'Metric prefix_my_metric is already registered');
    });
  });
  describe('#registerGauge', () => {
    it('should return a Gauge metric', () => {
      const name = 'my-gauge';
      const gauge = instance.registerGauge(name, 'my gauge help', ['foo', 'bar']);
      should(gauge).not.be.undefined();
      should(gauge.name).be.equal('prefix_my_gauge');
      should(gauge.set).be.Function();
      should(gauge.labelNames).be.eql(['foo', 'bar']);
      instance.getMetric(name).should.be.equal(gauge);
    });
    it('should throw error if already registered', () => {
      const name = 'my_metric';
      instance.registerGauge(name, name);
      should.throws(() => instance.registerGauge(name, name), 'Metric prefix_my_metric is already registered');
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
        instance = await makeInstance(prefix, gatewayUrl);
        gatewayMock = nock(gatewayUrl);
      });
      afterEach(() => {
        nock.cleanAll();
      });
      it('should push metrics to gateway', () => {
        gatewayMock.put('/metrics/job/prefix').reply(200);
        return instance
          .push()
          .should.be.fulfilled()
          .then(() => {
            gatewayMock.isDone().should.be.true();
          });
      });
      describe('when gateway returns error', () => {
        it('should be rejected with error from gateway', () => {
          gatewayMock.put('/metrics/job/prefix').replyWithError('Oops!');
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
  const Prometheus = (await import('../../../src/initializers/prometheus/prometheus')).default;
  return new Prometheus(prefix, gatewayUrl);
}
