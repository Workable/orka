import * as sinon from 'sinon';
import middleware from '../../../src/initializers/koa/parse-querystring';

const sandbox = sinon.createSandbox();

describe('parse-querystring', function () {
  let ctx, getRequestContextStub;

  beforeEach(function () {
    ctx = {
      querystring: 'firstname=john&lastname=doe&children[]=bolek&children[]=lolek',
      state: {},
    } as any;
  });

  it('parses querystring and calls next', async function () {
    // Prepare
    const next = sandbox.stub();

    // Execute
    await middleware(ctx, next);

    // Assert
    next.called.should.be.true();
    ctx.state.query.should.eql({
      firstname: 'john',
      lastname: 'doe',
      children: ['bolek', 'lolek']
    });
  });
});
