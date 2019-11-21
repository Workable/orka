import OrkaBuilder from '../src/orka-builder';
import * as sinon from 'sinon';
import * as redis from '../src/initializers/redis';

const sandbox = sinon.createSandbox();

describe('orka-builder', function() {
  afterEach(function() {
    sandbox.restore();
  });

  it('calls redis', async function() {
    const config = {};
    const stub = sandbox.stub(redis, 'createRedisConnection');
    const builder = new OrkaBuilder({}, { redis: config }, () => {});
    builder.withRedis();
    await builder.initTasks();
    stub.args.should.eql([[config]]);
  });
});
