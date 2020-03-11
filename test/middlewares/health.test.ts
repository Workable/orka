import * as sinon from 'sinon';
import { Context } from 'koa';
import 'should';
import health from '../../src/middlewares/health';
import * as mongodb from '../../src/initializers/mongodb';
import * as rabbitmq from '../../src/initializers/rabbitmq';

const sandbox = sinon.createSandbox();

describe('Health middleware', function() {
  let getConnectionStub, isHealthyStub;
  beforeEach(function() {
    getConnectionStub = sandbox.stub(mongodb, 'getConnection');
    isHealthyStub = sandbox.stub(rabbitmq, 'isHealthy');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('returns 200 when mongo connection is ok and rabbitmq is healthy', async function() {
    const ctx = {} as Context;
    getConnectionStub.returns({ readyState: 1 });
    isHealthyStub.returns(true);
    await health(ctx);
    ctx.status.should.eql(200);
  });

  it('returns 503 when mongo connection is down', async function() {
    const ctx = {} as Context;
    getConnectionStub.returns({ readyState: 2 });
    await health(ctx);
    ctx.status.should.eql(503);
  });

  it('return 503 when rabbitmq is not healthy', async function() {
    const ctx = {} as Context;
    getConnectionStub.returns({ readyState: 1 });
    isHealthyStub.returns(false);
    await health(ctx);
    ctx.status.should.eql(503);
  });
});
