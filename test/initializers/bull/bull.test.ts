import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import Prometheus from '../../../src/initializers/prometheus/prometheus';
import { assertThrows } from '../../helpers/assert-helpers';

describe('bull class', () => {
  const prefix = 'test';
  const queues = [
    { name: 'test_one', options: { delay: 1000 } },
    { name: 'rate_limited', limiter: { max: 10, duration: 1000 } }
  ];
  const defaultOptions = { removeOnComplete: true };
  const redisOptions = { url: 'redis://localhost:6379/' };
  let bull: any;
  let bullReuse: any;
  let MockQueue: any;
  let MockWorker: any;

  beforeEach(async () => {
    MockQueue = function(this: any, name: string, options: any) {
      this.name = name;
      this.qualifiedName = `${options.prefix}:${name}`;
      this.opts = options;
      this._events = {};
      return this;
    };
    MockQueue.prototype.count = mock.fn(async () => 10);
    MockQueue.prototype.getJobCounts = mock.fn(async () => ({
      active: 2,
      completed: 3,
      failed: 1,
      delayed: 4,
      waiting: 6
    }));
    MockQueue.prototype.on = mock.fn(function(this: any) { return this; });
    MockQueue.prototype.emit = mock.fn(function(this: any) { return this; });

    MockWorker = function(this: any, name: string, handler: any, options: any) {
      this.name = name;
      this.handler = handler;
      this.opts = options;
      this._events = { drained: [], error: [], failed: [] };
      return this;
    };
    MockWorker.prototype.on = mock.fn(function(this: any) { return this; });
    MockWorker.prototype.emit = mock.fn(function(this: any) { return this; });

    const mockRedisClient = {
      setMaxListeners: mock.fn(),
      quit: mock.fn(async () => {}),
      on: mock.fn(function(this: any) { return this; }),
      connect: mock.fn(async () => {}),
      disconnect: mock.fn(async () => {})
    };

    mock.module('bullmq', {
      namedExports: {
        Queue: MockQueue,
        Worker: MockWorker
      }
    });

    mock.module('ioredis', {
      defaultExport: mock.fn(() => mockRedisClient)
    });

    delete require.cache[require.resolve('../../../src/initializers/bull/bull')];
    const Bull = (await import('../../../src/initializers/bull/bull')).default;
    bull = new Bull(prefix, queues, defaultOptions, redisOptions);
    bullReuse = new Bull(prefix, queues, defaultOptions, redisOptions, undefined, true);
  });

  afterEach(function() {
    mock.restoreAll();
  });

  describe('getQueue', () => {
    describe('when queue is not configured', () => {
      it('should throw no such queue error', () => {
        assertThrows(() => bull.getQueue('unknown'), 'no such queue');
      });
    });
    describe('when queue is not initialized', () => {
      it('should create the queue and return its instance', () => {
        const name = 'test_one';
        const q = bull.getQueue(name);
        assert.ok(q !== undefined);
        assert.strictEqual(q.qualifiedName, `${prefix}:${name}`);
        assert.deepStrictEqual(q.opts, {
          connection: {
            url: 'redis://localhost:6379/',
          },
          defaultJobOptions: {
            delay: 1000,
            removeOnComplete: true,
          },
          prefix: 'test',
        });
      });
      it('should create the queue and return its instance with client reuse', () => {
        const name = 'test_one';
        const q = bullReuse.getQueue(name);
        assert.ok(q !== undefined);
        assert.strictEqual(q.qualifiedName, `${prefix}:${name}`);
        assert.strictEqual(typeof q.opts.createClient, 'function');
      });
      describe('when limiter options are configured', () => {
        it('should create a rate limited queue', () => {
          const name = 'rate_limited';
          const q = bull.getQueue(name);
          assert.ok(q !== undefined);
          assert.strictEqual(q.qualifiedName, `${prefix}:${name}`);
          assert.deepStrictEqual(q.opts, {
            connection: {
              url: 'redis://localhost:6379/',
            },
            defaultJobOptions: {
              removeOnComplete: true,
            },
            prefix: 'test',
          });
        });
      });
    });
    describe('when queue already initialized', () => {
      it('should return the same queue instance', () => {
        const name = 'test_one';
        const q1 = bull.getQueue(name);
        const q2 = bull.getQueue(name);
        assert.ok(q1 !== undefined);
        assert.ok(q2 !== undefined);
        assert.strictEqual(q1, q2);
      });
    });
  });

  describe('createWorker', () => {
    const jobHandler = () => Promise.resolve();

    describe('when worker queue is not configured', () => {
      it('should throw no such worker error', () => {
        assertThrows(() => bull.createWorker('unknown', jobHandler), 'no such worker');
      });
    });

    describe('when worker is created for the first time', () => {
      it('should create and return a worker instance', () => {
        const name = 'test_one';
        const worker = bull.createWorker(name, jobHandler);
        assert.ok(worker !== undefined);
        assert.deepStrictEqual(Object.keys(worker._events), ['drained', 'error', 'failed']);
      });
    });

    describe('when worker already exists', () => {
      it('should return the same worker instance and log a warning', () => {
        const name = 'test_one';
        const warnStub = mock.fn();
        const logger = { warn: warnStub, info: mock.fn(), error: mock.fn() };
        bull.logger = logger;

        const worker1 = bull.createWorker(name, jobHandler);
        const worker2 = bull.createWorker(name, jobHandler);

        assert.ok(worker1 !== undefined);
        assert.ok(worker2 !== undefined);
        assert.strictEqual(worker1, worker2);

        assert.strictEqual(warnStub.mock.calls.length, 1);
        assert.strictEqual(warnStub.mock.calls[0].arguments[0], `Worker ${name} already exists`);
      });
    });
  });

  describe('getWorker', () => {
    const jobHandler = () => Promise.resolve();

    describe('when worker queue is not configured', () => {
      it('should throw no such worker error', () => {
        assertThrows(() => bull.getWorker('unknown', jobHandler), 'no such worker');
      });
    });

    describe('when worker does not exist', () => {
      it('should throw no such worker error', () => {
        assertThrows(() => bull.getWorker('test_one', jobHandler), 'no such worker');
      });
    });

    describe('when worker exists', () => {
      it('should return the worker instance', () => {
        const name = 'test_one';
        const worker1 = bull.createWorker(name, jobHandler);
        const worker2 = bull.getWorker(name);

        assert.ok(worker1 !== undefined);
        assert.ok(worker2 !== undefined);
        assert.strictEqual(worker1, worker2);
      });
    });
  });

  describe('getStats', () => {
    it('should retrieve the stats from each queue configured', async () => {
      const stats = await bull.getStats();
      assert.deepStrictEqual(stats, [
        { queue: 'test_one', count: 10, active: 2, completed: 3, failed: 1, delayed: 4, waiting: 6 },
        { queue: 'rate_limited', count: 10, active: 2, completed: 3, failed: 1, delayed: 4, waiting: 6 }
      ]);
    });
  });

  describe('updateMetrics', () => {
    describe('when prometheus is not available', () => {
      it('should noop and log error', async () => {
        const errorLogSpy = mock.method(bull.logger, 'error', bull.logger.error);
        const getStatsSpy = mock.method(bull, 'getStats', bull.getStats);
        await bull.updateMetrics();
        assert.strictEqual(getStatsSpy.mock.calls.length, 0);
        assert.strictEqual(errorLogSpy.mock.calls.length, 1);
        assert.strictEqual(
          errorLogSpy.mock.calls[0].arguments[0].message,
          'Prometheus metrics not enabled, Bull queue metrics will not be exported'
        );
      });
    });
    describe('when prometheus is available', () => {
      let depth: any, active: any, completed: any, failed: any, delayed: any, waiting: any, register: any;
      beforeEach(async () => {
        depth = mock.fn();
        active = mock.fn();
        completed = mock.fn();
        failed = mock.fn();
        delayed = mock.fn();
        waiting = mock.fn();
        let callCount = 0;
        register = mock.fn(() => {
          callCount++;
          if (callCount === 1) return { set: depth };
          if (callCount === 2) return { set: active };
          if (callCount === 3) return { set: completed };
          if (callCount === 4) return { set: failed };
          if (callCount === 5) return { set: delayed };
          if (callCount === 6) return { set: waiting };
          return { set: mock.fn() };
        });

        const prometheus = {
          registerGauge: register
        } as unknown as Prometheus;
        const Bull = (await import('../../../src/initializers/bull/bull')).default;
        bull = new Bull(prefix, queues, defaultOptions, redisOptions, prometheus);
      });
      it('should add queue metrics to prometheus', async () => {
        const getStatsSpy = mock.method(bull, 'getStats', bull.getStats);
        await bull.updateMetrics();
        assert.strictEqual(getStatsSpy.mock.calls.length, 1);
        assert.strictEqual(depth.mock.calls.length, queues.length);
        assert.strictEqual(active.mock.calls.length, queues.length);
        assert.strictEqual(completed.mock.calls.length, queues.length);
        assert.strictEqual(failed.mock.calls.length, queues.length);
        assert.strictEqual(delayed.mock.calls.length, queues.length);
        assert.strictEqual(waiting.mock.calls.length, queues.length);
        
        queues.forEach((q, index) => {
          const queue = q.name;
          assert.deepStrictEqual(depth.mock.calls[index].arguments, [{ queue }, 10]);
          assert.deepStrictEqual(active.mock.calls[index].arguments, [{ queue }, 2]);
          assert.deepStrictEqual(completed.mock.calls[index].arguments, [{ queue }, 3]);
          assert.deepStrictEqual(failed.mock.calls[index].arguments, [{ queue }, 1]);
          assert.deepStrictEqual(delayed.mock.calls[index].arguments, [{ queue }, 4]);
          assert.deepStrictEqual(waiting.mock.calls[index].arguments, [{ queue }, 6]);
        });
      });
    });
  });
});
