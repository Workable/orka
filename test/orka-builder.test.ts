import OrkaBuilder from '../src/orka-builder';
import * as sinon from 'sinon';
import 'should';
import * as redis from '../src/initializers/redis';
import type WorkerType from '../src/initializers/worker';
import rejectBrotliEncoding from '../src/middlewares/reject-brotli-encoding';

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

  describe('useDefaults', function () {
    const config = { requestContext: { enabled: false }, allowedOrigins: ['localhost'] };

    it('registers rejectBrotliEncoding before bodyParser by default', function () {
      const builder = new OrkaBuilder({}, config, () => undefined, sandbox.stub());
      builder.useDefaults();
      builder.koaTasks[1]().should.equal(rejectBrotliEncoding);
    });

    it('skips rejectBrotliEncoding when config.rejectBrotliEncoding.enabled is false', function () {
      const builder = new OrkaBuilder(
        {},
        { ...config, rejectBrotliEncoding: { enabled: false } },
        () => undefined,
        sandbox.stub()
      );
      builder.useDefaults();
      builder.koaTasks[1]().name.should.equal('bodyParser');
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
