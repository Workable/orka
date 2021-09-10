import OrkaBuilder from '../src/orka-builder';
import * as sinon from 'sinon';
import * as redis from '../src/initializers/redis';
import type WorkerType from '../src/initializers/worker';

const sandbox = sinon.createSandbox();

describe('orka-builder', function () {
  afterEach(function () {
    sandbox.restore();
  });

  describe('withRedis', function () {
    it('calls redis', async function () {
      const config = {};
      const stub = sandbox.stub(redis, 'createRedisConnection');
      const builder = new OrkaBuilder({}, { redis: config }, () => undefined, sandbox.stub());
      builder.withRedis();
      await builder.initTasks();
      stub.args.should.eql([[config]]);
    });
  });

  describe('createWorker', function () {
    it('creates and returns worker', async function () {
      const Worker: { default: typeof WorkerType } = require('../src/initializers/worker');
      const obj = {};
      const stub = sandbox.stub(Worker, 'default').returns(obj);
      const builder = new OrkaBuilder({}, {}, () => undefined, sandbox.stub());
      const worker = builder.createWorker('name');
      worker.should.equal(obj);
      stub.args.should.eql([[builder, 'name']]);
    });
  });
});
