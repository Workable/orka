import should = require('should');
const mock = require('mock-require');
import * as sinon from 'sinon';
import Prometheus from '../../../src/initializers/prometheus/prometheus';

const sandbox = sinon.createSandbox();

describe('bull class', () => {
  const prefix = 'test';
  const queues = [
    { name: 'test_one', options: { delay: 1000 } },
    { name: 'rate_limited', limiter: { max: 10, duration: 1000 } }
  ];
  const defaultOptions = { removeOnComplete: true };
  const redisOptions = { url: 'redis://localhost:6379/' };
  let bull;
  let bullReuse;

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(async () => {
    mock('ioredis',
        class IoredisMock {
          public setMaxListeners(){}
        }
    );
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
        public async getJobCounts() {
          return {
            active: 2,
            completed: 3,
            failed: 1,
            delayed: 4,
            waiting: 6
          };
        }
        public async getFailedCount() {
          return 3;
        }
      }
    );
    const Bull = (await import('../../../src/initializers/bull/bull')).default;
    bull = new Bull(prefix, queues, defaultOptions, redisOptions);
    bullReuse = new Bull(prefix, queues, defaultOptions, redisOptions, undefined, true);
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
      it('should create the queue and return its instance', () => {
        const name = 'test_one';
        const q = bullReuse.getQueue(name);
        q.should.not.be.undefined();
        q.name.should.be.equal(`${prefix}:${name}`);
        q.opts.createClient.should.be.Function();
        q.eventListeners.should.be.eql(['drained', 'error', 'failed']);
      });
      describe('when limiter options are configured', () => {
        it('should create a rate limited queue', () => {
          const name = 'rate_limited';
          const q = bull.getQueue(name);
          q.should.not.be.undefined();
          q.name.should.be.equal(`${prefix}:${name}`);
          q.opts.should.be.eql({
            redis: redisOptions,
            defaultJobOptions: { removeOnComplete: true },
            limiter: { max: 10, duration: 1000 }
          });
          q.eventListeners.should.be.eql(['drained', 'error', 'failed']);
        });
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
      stats.should.be.eql([
        { queue: 'test_one', count: 10, active: 2, completed: 3, failed: 1, delayed: 4, waiting: 6 },
        { queue: 'rate_limited', count: 10, active: 2, completed: 3, failed: 1, delayed: 4, waiting: 6 }
      ]);
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
      let depth, active, completed, failed, delayed, waiting, register;
      beforeEach(async () => {
        depth = sandbox.stub();
        active = sandbox.stub();
        completed = sandbox.stub();
        failed = sandbox.stub();
        delayed = sandbox.stub();
        waiting = sandbox.stub();
        register = sandbox.stub();
        register.onCall(0).returns({ set: depth });
        register.onCall(1).returns({ set: active });
        register.onCall(2).returns({ set: completed });
        register.onCall(3).returns({ set: failed });
        register.onCall(4).returns({ set: delayed });
        register.onCall(5).returns({ set: waiting });

        const prometheus = {
          registerGauge: register
        } as Prometheus;
        const Bull = (await import('../../../src/initializers/bull/bull')).default;
        bull = new Bull(prefix, queues, defaultOptions, redisOptions, prometheus);
      });
      it('should add queue metrics to prometheus', async () => {
        const getStatsSpy = sandbox.spy(bull, 'getStats');
        await bull.updateMetrics();
        sandbox.assert.calledOnce(getStatsSpy);
        sandbox.assert.callCount(depth, queues.length);
        sandbox.assert.callCount(active, queues.length);
        sandbox.assert.callCount(completed, queues.length);
        sandbox.assert.callCount(failed, queues.length);
        sandbox.assert.callCount(delayed, queues.length);
        sandbox.assert.callCount(waiting, queues.length);
        queues.forEach(q => {
          const queue = q.name;
          sandbox.assert.calledWith(depth, { queue }, 10);
          sandbox.assert.calledWith(active, { queue }, 2);
          sandbox.assert.calledWith(completed, { queue }, 3);
          sandbox.assert.calledWith(failed, { queue }, 1);
          sandbox.assert.calledWith(delayed, { queue }, 4);
          sandbox.assert.calledWith(waiting, { queue }, 6);
        });
      });
    });
  });
});
