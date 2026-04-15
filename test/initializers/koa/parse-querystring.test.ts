import * as sinon from 'sinon';
import parseQuerystring from '../../../src/initializers/koa/parse-querystring';

const sandbox = sinon.createSandbox();

const defaultConfig = {
  queryParser: {
    arrayLimit: 1000,
    parameterLimit: 1000,
    depth: 5
  }
};

describe('parse-querystring', function () {
  let ctx;

  beforeEach(function () {
    ctx = {
      querystring: 'firstname=john&lastname=doe&children[]=bolek&children[]=lolek',
      state: {}
    } as any;
  });

  it('parses querystring and calls next', async function () {
    // Prepare
    const next = sandbox.stub();
    const middleware = parseQuerystring(defaultConfig);

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

  it('overrides query in state', async function () {
    // Prepare
    const next = sandbox.stub();
    const middleware = parseQuerystring(defaultConfig);

    // Execute
    await middleware(ctx, next);

    // Assert
    next.called.should.be.true();
    ctx.state.query = 'asd';
    ctx.state.query.should.eql('asd');
  });

  it('keeps bracket arrays (a[]=...) with more than 20 elements as arrays by default', async function () {
    const next = sandbox.stub();
    const middleware = parseQuerystring(defaultConfig);
    const count = 25;
    ctx.querystring = Array.from({ length: count }, (_, i) => `items[]=${i}`).join('&');

    await middleware(ctx, next);

    next.called.should.be.true();
    Array.isArray(ctx.state.query.items).should.be.true();
    ctx.state.query.items.should.have.length(count);
  });

  it('keeps indexed bracket keys (a[0]=, a[1]=, ...) as arrays when within default arrayLimit', async function () {
    const next = sandbox.stub();
    const middleware = parseQuerystring(defaultConfig);
    const count = 25;
    ctx.querystring = Array.from({ length: count }, (_, i) => `items[${i}]=${i}`).join('&');

    await middleware(ctx, next);

    next.called.should.be.true();
    Array.isArray(ctx.state.query.items).should.be.true();
    ctx.state.query.items.should.have.length(count);
  });

  it('respects a lower custom arrayLimit for indexed bracket keys', async function () {
    const next = sandbox.stub();
    const middleware = parseQuerystring({
      queryParser: {
        arrayLimit: 10,
        parameterLimit: 1000,
        depth: 5
      }
    });
    const count = 25;
    ctx.querystring = Array.from({ length: count }, (_, i) => `items[${i}]=${i}`).join('&');

    await middleware(ctx, next);

    next.called.should.be.true();
    Array.isArray(ctx.state.query.items).should.be.false();
  });
});
