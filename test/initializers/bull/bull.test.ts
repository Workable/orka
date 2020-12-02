import should = require('should');
const mock = require('mock-require');
import * as sinon from 'sinon';

const sandbox = sinon.createSandbox();

describe('bull class', () => {
  const prefix = 'test';
  const queues = [{ name: 'test_one', options: { delay: 1000 } }];
  const defaultOptions = { removeOnComplete: true };
  const redisOptions = { url: 'redis://localhost:6379/' };
  let bull;

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(async () => {
    mock(
      'bull',
      class QueMock {
        public name: string;
        public opts: any;
        public eventListeners: string[] = [];
        constructor(name: string, opts: any) {
          this.name = name;
          this.opts = opts;
        }
        public on(event: string, cb: any) {
          this.eventListeners.push(event);
          return this;
        }
        public async count() {
          return 10;
        }
        public async getFailedCount() {
          return 3;
        }
      }
    );
    const Bull = (await import('../../../src/initializers/bull/bull')).default;
    bull = new Bull(prefix, queues, defaultOptions, redisOptions);
  });

  describe('getQueue', () => {
    describe('when queue is not configured', () => {
      it('should throw no such queue error', () => {
        should.throws(() => bull.getQueue('unknown'), 'no such queue');
      });
    });
    describe('when queue is not initialized', () => {
      it('should create the queue and return its instance', () => {
        const name = 'test_one';
        const q = bull.getQueue(name);
        q.should.not.be.undefined();
        q.name.should.be.equal(`${prefix}:${name}`);
        q.opts.should.be.eql({ redis: redisOptions, defaultJobOptions: { delay: 1000, removeOnComplete: true } });
        q.eventListeners.should.be.eql(['drained', 'error', 'failed']);
      });
    });
    describe('when queue already initialized', () => {
      it('should return the same queue instance', () => {
        const name = 'test_one';
        const q1 = bull.getQueue(name);
        const q2 = bull.getQueue(name);
        q1.should.not.be.undefined();
        q2.should.not.be.undefined();
        q1.should.be.equal(q2);
      });
    });
  });
  describe('getStats', () => {
    it('should retrieve the stats from each queue configured', async () => {
      const stats = await bull.getStats();
      stats.should.be.eql([{ queue: 'test_one', count: 10, failed: 3 }]);
    });
  });

  describe('updateMetrics', () => {
    describe('when prometheus is not available', () => {
      it('should noop and log error', async () => {
        const errorLogSpy = sandbox.spy(bull.logger, 'error');
        const getStatsSpy = sandbox.spy(bull, 'getStats');
        await bull.updateMetrics();
        sandbox.assert.notCalled(getStatsSpy);
        sandbox.assert.calledOnce(errorLogSpy);
        should(errorLogSpy.args[0][0].message).be.equal(
          'Prometheus metrics not enabled, Bull queue metrics will not be exported'
        );
      });
    });
    describe('when prometheus is available', () => {
      let depth, failed, register;
      beforeEach(async () => {
        depth = sandbox.stub();
        failed = sandbox.stub();
        register = sandbox.stub();
        register.onCall(0).returns({ set: depth });
        register.onCall(1).returns({ set: failed });
        const prometheus = {
          registerGauge: register
        };
        const Bull = (await import('../../../src/initializers/bull/bull')).default;
        bull = new Bull(prefix, queues, defaultOptions, redisOptions, prometheus);
      });
      it('should add queue metrics to prometheus', async () => {
        const queue = 'test_one';
        const getStatsSpy = sandbox.spy(bull, 'getStats');
        await bull.updateMetrics();
        sandbox.assert.calledOnce(getStatsSpy);
        sandbox.assert.calledOnce(depth);
        sandbox.assert.calledWith(depth, { queue }, 10);
        sandbox.assert.calledOnce(failed);
        sandbox.assert.calledWith(failed, { queue }, 3);
      });
    });
    describe('deprecated methods', () => {
      const expected =
        '***\nDEPRECATED: See https://github.com/Workable/orka/blob/master/README.md how to configure the Metrics middleware\n***';
      let warnLogSpy;
      beforeEach(() => {
        warnLogSpy = sandbox.spy(bull.logger, 'warn');
      });
      describe('startMetrics', () => {
        it('should log deprecation warning', () => {
          bull.startMetrics();
          sandbox.assert.calledWith(warnLogSpy, expected);
        });
      });
      describe('stopMetrics', () => {
        it('should log deprecation warning', () => {
          bull.stopMetrics();
          sandbox.assert.calledWith(warnLogSpy, expected);
        });
      });
    });
  });
});
