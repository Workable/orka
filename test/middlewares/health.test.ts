import * as sinon from 'sinon';
import { Context } from 'koa';
import 'should';
import health from '../../src/middlewares/health';
import * as mongodb from '../../src/initializers/mongodb';

const sandbox = sinon.createSandbox();

describe('Health middleware', function() {
  let getConnectionStub;
  beforeEach(function() {
    getConnectionStub = sandbox.stub(mongodb, 'getConnection');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('returns 200 when mongo connection is ok', async function() {
    const ctx = {} as Context;
    getConnectionStub.returns({ readyState: 1 });
    await health(ctx);
    ctx.status.should.eql(200);
  });

  it('returns 503 when mongo connection is down', async function() {
    const ctx = {} as Context;
    getConnectionStub.returns({ readyState: 2 });
    await health(ctx);
    ctx.status.should.eql(503);
  });
});
