import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import OrkaBuilder from '../src/orka-builder';
import * as redis from '../src/initializers/redis';
import type WorkerType from '../src/initializers/worker';

describe('orka-builder', function () {
  afterEach(function () {
    mock.restoreAll();
  });

  describe('withRedis', function () {
    it('calls redis', async function () {
      const config = {};
      const stub = mock.method(redis, 'createRedisConnection');
      const builder = new OrkaBuilder({}, { redis: config }, () => undefined, mock.fn());
      builder.withRedis();
      await builder.initTasks();
      assert.deepStrictEqual(stub.mock.calls.map(c => c.arguments), [[config]]);
    });
  });

  describe('createWorker', function () {
    it('creates and returns worker', async function () {
      const Worker: { default: typeof WorkerType } = require('../src/initializers/worker');
      const obj = {};
      const stub = mock.method(Worker, 'default', () => obj);
      const builder = new OrkaBuilder({}, {}, () => undefined, mock.fn());
      const worker = builder.createWorker('name');
      assert.strictEqual(worker, obj);
      assert.deepStrictEqual(stub.mock.calls.map(c => c.arguments), [[builder, 'name']]);
    });
  });
});
