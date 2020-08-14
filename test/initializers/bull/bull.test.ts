import should = require('should');
const mock = require('mock-require');
import * as sinon from 'sinon';
import * as cron from 'node-cron';

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
  describe('startMetrics', () => {
    describe('when invalid cron expression is provided', () => {
      it('should throw invalid cron expression error', () => {
        const cronExpression = 'invalid cron expression';
        should.throws(() => bull.startMetrics(cronExpression), `Invalid cron expression: ${cronExpression}`);
      });
    });
    describe('when metrics not started before', () => {
      it('should schedule a metrics reporting task bases on the provided cron expression', () => {
        const cronExpression = '*/10 * * * * *';
        const scheduleMock = sandbox.stub(cron, 'schedule');
        bull.startMetrics(cronExpression);
        sandbox.assert.calledOnce(scheduleMock);
        sandbox.assert.calledWith(scheduleMock, cronExpression);
      });
    });
    describe('when metrics already started', () => {
      it('should throw "metrics task already running" error', () => {
        const cronExpression = '*/10 * * * * *';
        const scheduleMock = sandbox.stub(cron, 'schedule').returns({});
        bull.startMetrics(cronExpression);
        should.throws(() => bull.startMetrics(cronExpression), 'Metrics task already running');
        sandbox.assert.calledOnce(scheduleMock);
      });
    });
  });
  describe('stopMetrics', () => {
    describe('when no task is running', () => {
      it('should throw task not currently running error', () => {
        should.throws(() => bull.stopMetrics(), 'Metrics task not currently running');
      });
    });
    describe('when a task is running', () => {
      it('should stop the task', () => {
        const destroyMock = sandbox.stub();
        const cronExpression = '*/10 * * * * *';
        sandbox.stub(cron, 'schedule').returns({ destroy: destroyMock });
        bull.startMetrics(cronExpression);
        bull.stopMetrics();
        sandbox.assert.calledOnce(destroyMock);
      });
    });
  });
});
