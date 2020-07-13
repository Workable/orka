import * as sinon from 'sinon';
import { Context } from 'koa';
import 'should';
import health from '../../src/middlewares/health';
import * as mongodb from '../../src/initializers/mongodb';
import * as rabbitmq from '../../src/initializers/rabbitmq';
import OrkaBuilder from '../../src/orka-builder';

const sandbox = sinon.createSandbox();

describe('Health middleware', function() {
  let getConnectionStub, isHealthyStub, orkaBuilderStub;
  beforeEach(function() {
    getConnectionStub = sandbox.stub(mongodb, 'getConnection');
    isHealthyStub = sandbox.stub(rabbitmq, 'isHealthy');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('returns 200 when mongo connection is ok and rabbitmq is healthy', async function() {
    const version = process.env.npm_package_version;
    process.env.npm_package_version = '2.44.0';
    const ctx = {} as Context;
    getConnectionStub.returns({ readyState: 1 });
    OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test' } } as any;
    isHealthyStub.returns(true);
    const next = sandbox.stub();
    await health(ctx, next);
    ctx.status.should.eql(200);
    ctx.body.version.should.eql('2.44.0');
    ctx.body.env.should.eql('test');
    next.called.should.be.true();
    process.env.npm_package_version = version;
  });

  it('returns 503 when mongo connection is down', async function() {
    const ctx = {} as Context;
    getConnectionStub.returns({ readyState: 2 });
    const next = sandbox.stub();
    await health(ctx, next);
    next.called.should.be.true();
    ctx.status.should.eql(503);
  });

  it('return 503 when rabbitmq is not healthy', async function() {
    const ctx = {} as Context;
    getConnectionStub.returns({ readyState: 1 });
    isHealthyStub.returns(false);
    const next = sandbox.stub();
    await health(ctx, next);
    next.called.should.be.true();
    ctx.status.should.eql(503);
  });
});
