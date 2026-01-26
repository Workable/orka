import { describe, it, before, beforeEach, afterEach, after, mock } from 'node:test';
import assert from 'node:assert';
import Worker from '../../src/initializers/worker';
import WorkerJob from '../../src/initializers/worker/worker-job';
import OrkaBuilder from '../../src/orka-builder';
import * as mongoose from 'mongoose';
import { getLogger } from '../../src/initializers/log4js';
import { assertContainsDeep } from '../helpers/assert-helpers';

describe('Test worker', function () {
  before(async function () {
    await mongoose.connect('mongodb://localhost/orka');
  });

  beforeEach(async function () {
    await WorkerJob.deleteMany({});
  });

  afterEach(function () {
    mock.restoreAll();
  });

  after(async function () {
    mongoose.connection.close();
  });

  describe('initialize sets progress', function () {
    it('runs initializeCB updates state then executeCB and updates state', async function () {
      const logger = getLogger(`workers.name`);
      mock.method(logger, 'info', () => { /* noop */ });
      const orka = new OrkaBuilder({}, {}, () => undefined, mock.fn());
      const worker = new Worker(orka, 'name');
      let resolveInitialize: any;
      let resolveExecuteCB: any;
      let init: any;
      let exec: any;
      const initialized = new Promise(r => (init = r));
      const executed = new Promise(r => (exec = r));
      const initializeCB = async (job: any) => {
        init();
        job.payload = { progress: 0 };

        await new Promise(r => (resolveInitialize = r));
      };
      const executeCB = async (job: any) => {
        exec();
        job.payload = { progress: 100 };
        await new Promise(r => (resolveExecuteCB = r));
      };
      const start = worker.start(initializeCB, executeCB);
      assert.strictEqual(await WorkerJob.findOne({ name: 'name' }), null);
      await initialized;
      await resolveInitialize();
      await executed;
      const job1 = await WorkerJob.findOne({ name: 'name' });
      assertContainsDeep(job1!.toJSON(), {
        payload: {
          progress: 0
        },
        initialized: true
      });
      assert.strictEqual(job1!.toJSON().finished, undefined);
      resolveExecuteCB();
      await start;
      const job2 = await WorkerJob.findOne({ name: 'name' });
      assertContainsDeep(job2!.toJSON(), {
        payload: {
          progress: 100
        },
        initialized: true,
        finished: true
      });
    });
  });

  describe('document already exists in db', function () {
    it('runs initializeCB updates state then executeCB and updates state', async function () {
      await WorkerJob.create({ name: 'name', initialized: false });
      const logger = getLogger(`workers.name`);
      mock.method(logger, 'info', () => { /* noop */ });
      const orka = new OrkaBuilder({}, {}, () => undefined, mock.fn());
      const worker = new Worker(orka, 'name');
      let resolveInitialize: any;
      let resolveExecuteCB: any;
      let init: any;
      let exec: any;
      const initialized = new Promise(r => (init = r));
      const executed = new Promise(r => (exec = r));
      const initializeCB = async (job: any) => {
        init();
        job.payload = { progress: 0 };
        await new Promise(r => (resolveInitialize = r));
        return job;
      };
      const executeCB = async (job: any) => {
        exec();
        job.payload = { progress: 100 };
        await new Promise(r => (resolveExecuteCB = r));
      };
      const start = worker.start(initializeCB, executeCB);
      await initialized;
      resolveInitialize();
      await executed;
      const job1 = await WorkerJob.findOne({ name: 'name' });
      assertContainsDeep(job1!.toJSON(), {
        payload: {
          progress: 0
        },
        initialized: true
      });
      assert.strictEqual(job1!.toJSON().finished, undefined);
      resolveExecuteCB();
      await start;
      const job2 = await WorkerJob.findOne({ name: 'name' });
      assertContainsDeep(job2!.toJSON(), {
        payload: {
          progress: 100
        },
        initialized: true,
        finished: true
      });
    });
  });

  describe('worker is already initialized', function () {
    it('runs executeCB and updates state', async function () {
      await WorkerJob.create({ name: 'name', initialized: true });
      const logger = getLogger(`workers.name`);
      mock.method(logger, 'info', () => { /* noop */ });
      const orka = new OrkaBuilder({}, {}, () => undefined, mock.fn());
      const worker = new Worker(orka, 'name');
      let resolveExecuteCB: any;
      let exec: any;
      const executed = new Promise(r => (exec = r));
      const initializeCB = async (job: any) => ({});
      const executeCB = async (job: any) => {
        exec();
        job.payload = { progress: 100 };
        await new Promise(r => (resolveExecuteCB = r));
      };
      const start = worker.start(initializeCB as any, executeCB);
      await executed;
      resolveExecuteCB();
      await start;
      const job = await WorkerJob.findOne({ name: 'name' });
      assertContainsDeep(job!.toJSON(), {
        payload: {
          progress: 100
        },
        initialized: true,
        finished: true
      });
    });
  });

  describe('worker throws error', function () {
    it('runs executeCB and updates state and reruns start after delay', async function () {
      await WorkerJob.create({ name: 'name', initialized: true });
      const logger = getLogger(`workers.name`);
      mock.method(logger, 'info', () => { /* noop */ });
      mock.method(logger, 'error', () => { /* noop */ });
      const orka = new OrkaBuilder({}, { workers: { initializationCheckDelay: 10 } }, () => undefined, mock.fn());
      const worker = new Worker(orka, 'name');
      const initializeCB = async (job: any) => ({});
      const executeCB = async (job: any) => {
        throw new Error('test');
      };
      const start = worker.start(initializeCB as any, executeCB);
      worker.start = mock.fn() as any;
      await start;
      assert.deepStrictEqual((worker.start as any).mock.calls[0].arguments, [initializeCB, executeCB]);
    });
  });

  describe('worker is already finished', function () {
    it('will retry start after delay', async function () {
      await WorkerJob.create({ name: 'name', initialized: true, finished: true });
      const logger = getLogger(`workers.name`);
      mock.method(logger, 'info', () => { /* noop */ });
      const orka = new OrkaBuilder({}, { workers: { retryDelay: 10 } }, () => undefined, mock.fn());
      const worker = new Worker(orka, 'name');
      const initializeCB = async (job: any) => {
        job.payload = { progress: 0 };
      };
      const executeCB = async (job: any) => {
        job.payload = { progress: 100 };
      };
      const start = worker.start(initializeCB, executeCB);
      worker.start = mock.fn() as any;
      await start;
      assert.deepStrictEqual((worker.start as any).mock.calls[0].arguments, [initializeCB, executeCB]);
    });
  });
});
