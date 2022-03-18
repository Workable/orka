import Worker from '../../src/initializers/worker';
import WorkerJob from '../../src/initializers/worker/worker-job';
import OrkaBuilder from '../../src/orka-builder';
import * as sinon from 'sinon';
import * as snapshot from 'snap-shot-it';
import * as mongoose from 'mongoose';
import * as should from 'should';
import { getLogger } from '../../src/initializers/log4js';
const sandbox = sinon.createSandbox();

describe('Test worker', function () {
  before(async function () {
    await mongoose.connect('mongodb://localhost/orka');
  });

  beforeEach(async function () {
    await WorkerJob.deleteMany({});
  });

  afterEach(function () {
    sandbox.restore();
  });

  after(async function () {
    mongoose.connection.close();
  });

  context('initialize sets progress', function () {
    it('runs initializeCB updates state then executeCB and updates state', async function () {
      const logger = getLogger(`workers.name`);
      sandbox.stub(logger, 'info');
      const orka = new OrkaBuilder({}, {}, () => undefined, sandbox.stub());
      const worker = new Worker(orka, 'name');
      let resolveInitialize;
      let resolveExecuteCB;
      let init;
      let exec;
      const initialized = new Promise(r => (init = r));
      const executed = new Promise(r => (exec = r));
      const initializeCB = async job => {
        init();
        job.payload = { progress: 0 };

        await new Promise(r => (resolveInitialize = r));
      };
      const executeCB = async job => {
        exec();
        job.payload = { progress: 100 };
        await new Promise(r => (resolveExecuteCB = r));
      };
      const start = worker.start(initializeCB, executeCB);
      should.equal(null, await WorkerJob.findOne({ name: 'name' }));
      await initialized;
      await resolveInitialize();
      await executed;
      (await WorkerJob.findOne({ name: 'name' })).toJSON().should.containDeep({
        payload: {
          progress: 0
        },
        initialized: true,
        finished: undefined
      });
      resolveExecuteCB();
      await start;
      (await WorkerJob.findOne({ name: 'name' })).toJSON().should.containDeep({
        payload: {
          progress: 100
        },
        initialized: true,
        finished: true
      });
      snapshot((logger.info as any).args);
    });
  });

  context('document already exists in db', function () {
    it('runs initializeCB updates state then executeCB and updates state', async function () {
      await WorkerJob.create({ name: 'name', initialized: false });
      const logger = getLogger(`workers.name`);
      sandbox.stub(logger, 'info');
      const orka = new OrkaBuilder({}, {}, () => undefined, sandbox.stub());
      const worker = new Worker(orka, 'name');
      let resolveInitialize;
      let resolveExecuteCB;
      let init;
      let exec;
      const initialized = new Promise(r => (init = r));
      const executed = new Promise(r => (exec = r));
      const initializeCB = async job => {
        init();
        job.payload = { progress: 0 };
        await new Promise(r => (resolveInitialize = r));
        return job;
      };
      const executeCB = async job => {
        exec();
        job.payload = { progress: 100 };
        await new Promise(r => (resolveExecuteCB = r));
      };
      const start = worker.start(initializeCB, executeCB);
      await initialized;
      resolveInitialize();
      await executed;
      (await WorkerJob.findOne({ name: 'name' })).toJSON().should.containDeep({
        payload: {
          progress: 0
        },
        initialized: true,
        finished: undefined
      });
      resolveExecuteCB();
      await start;
      (await WorkerJob.findOne({ name: 'name' })).toJSON().should.containDeep({
        payload: {
          progress: 100
        },
        initialized: true,
        finished: true
      });
      snapshot((logger.info as any).args);
    });
  });

  context('worker is already initialized', function () {
    it('runs executeCB and updates state', async function () {
      await WorkerJob.create({ name: 'name', initialized: true });
      const logger = getLogger(`workers.name`);
      sandbox.stub(logger, 'info');
      const orka = new OrkaBuilder({}, {}, () => undefined, sandbox.stub());
      const worker = new Worker(orka, 'name');
      let resolveExecuteCB;
      let exec;
      const executed = new Promise(r => (exec = r));
      const initializeCB = async job => ({});
      const executeCB = async job => {
        exec();
        job.payload = { progress: 100 };
        await new Promise(r => (resolveExecuteCB = r));
      };
      const start = worker.start(initializeCB as any, executeCB);
      await executed;
      resolveExecuteCB();
      await start;
      (await WorkerJob.findOne({ name: 'name' })).toJSON().should.containDeep({
        payload: {
          progress: 100
        },
        initialized: true,
        finished: true
      });
      snapshot((logger.info as any).args);
    });
  });

  context('worker throws error', function () {
    it('runs executeCB and updates state and reruns start after delay', async function () {
      await WorkerJob.create({ name: 'name', initialized: true });
      const logger = getLogger(`workers.name`);
      sandbox.stub(logger, 'info');
      sandbox.stub(logger, 'error');
      const orka = new OrkaBuilder({}, { workers: { initializationCheckDelay: 10 } }, () => undefined, sandbox.stub());
      const worker = new Worker(orka, 'name');
      const initializeCB = async job => ({});
      const executeCB = async job => {
        throw new Error('test');
      };
      const start = worker.start(initializeCB as any, executeCB);
      worker.start = sandbox.stub();
      await start;
      snapshot((logger.info as any).args);
      snapshot((logger.error as any).args);
      (worker.start as any).args.should.eql([[initializeCB, executeCB]]);
    });
  });

  context('worker is already finished', function () {
    it('will retry start after delay', async function () {
      await WorkerJob.create({ name: 'name', initialized: true, finished: true });
      const logger = getLogger(`workers.name`);
      sandbox.stub(logger, 'info');
      const orka = new OrkaBuilder({}, { workers: { retryDelay: 10 } }, () => undefined, sandbox.stub());
      const worker = new Worker(orka, 'name');
      const initializeCB = async job => {
        job.payload = { progress: 0 };
      };
      const executeCB = async job => {
        job.payload = { progress: 100 };
      };
      const start = worker.start(initializeCB, executeCB);
      worker.start = sandbox.stub();
      await start;
      snapshot((logger.info as any).args);
      (worker.start as any).args.should.eql([[initializeCB, executeCB]]);
    });
  });
});
