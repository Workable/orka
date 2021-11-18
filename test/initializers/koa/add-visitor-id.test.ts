import * as should from 'should';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

const sandbox = sinon.createSandbox();

describe('add-visitor-id', function () {
  let ctx, middleware, visitorWrapper, getRequestContextStub;
  const visitor = '883b16f6-b589-4786-a1fb-4f53ed38d5cf';
  const config = {
    visitor: {
      cookie: 'wmc'
    }
  };

  beforeEach(function () {
    getRequestContextStub = sandbox.stub();
    ctx = {
      origin: 'https://apply.workable.com/foo',
      state: {},
      cookies: {
        get: () => encodeURIComponent(JSON.stringify({ cookie_id: visitor }))
      }
    } as any;
    visitorWrapper = proxyquire('../../../src/initializers/koa/add-visitor-id', {
      'uuid': {
        v4: () => 'new-uuid'
      },
      '../../../src/builder': {
        getRequestContext: () => ({ set: getRequestContextStub })
      }
    }).default;
    middleware = visitorWrapper(config);
  });

  it('sets visitor cookie to state and to requestContext', async function () {
    // Prepare
    const next = sandbox.stub();

    // Execute
    await middleware(ctx, next);

    // Assert
    next.called.should.be.true();
    ctx.state.visitor.should.equal(visitor);
    getRequestContextStub.args.should.eql([['visitor', visitor]]);
  });

  it('skips visitor setting if it is /health', async function () {
    // Prepare
    const next = sandbox.stub();
    ctx.path = '/health';

    // Execute
    await middleware(ctx, next);

    // Assert
    next.called.should.be.true();
    should(ctx.state.visitor).be.undefined();
  });

  it('calls next if failed to decode', async function () {
    // Prepare
    const next = sandbox.stub();
    ctx.cookies.get = () => 'foobar';

    // Execute
    await middleware(ctx, next);

    // Assert
    next.called.should.be.true();
    should(ctx.state.visitor).be.undefined();
  });

  it('sets new cookie if cookie not exists and setCookie=true', async function () {
    // Prepare
    const next = sandbox.stub();
    middleware = visitorWrapper({
      ...config,
      visitor: {
        ...config.visitor,
        setCookie: true,
        maxAge: '1d',
        secure: true
      }
    });
    ctx.cookies.get = () => undefined;
    ctx.cookies.set = sandbox.stub();

    // Execute
    await middleware(ctx, next);

    // Assert
    next.called.should.be.true();
    ctx.cookies.set.args.should.eql([[
      'wmc',
      '%7B%22cookie_id%22%3A%22new-uuid%22%7D',
      {
        domain: '.workable.com',
        httpOnly: false,
        maxAge: 86400000,
        sameSite: 'none',
        secure: true,
      }
    ]]);
    ctx.state.visitor.should.equal('new-uuid');
    getRequestContextStub.args.should.eql([['visitor', 'new-uuid']]);
  });

  it('sets new cookie and overrides cookie domain', async function () {
    // Prepare
    const next = sandbox.stub();
    middleware = visitorWrapper({
      ...config,
      visitor: {
        ...config.visitor,
        setCookie: true,
        maxAge: '1d',
        secure: true,
        getCookieDomain: ctx => ctx.state.cookieDomain
      }
    });
    ctx.state.cookieDomain = '.facebook.com';
    ctx.cookies.get = () => undefined;
    ctx.cookies.set = sandbox.stub();

    // Execute
    await middleware(ctx, next);

    // Assert
    next.called.should.be.true();
    ctx.cookies.set.args.should.eql([[
      'wmc',
      '%7B%22cookie_id%22%3A%22new-uuid%22%7D',
      {
        domain: ctx.state.cookieDomain,
        httpOnly: false,
        maxAge: 86400000,
        sameSite: 'none',
        secure: true,
      }
    ]]);
    ctx.state.visitor.should.equal('new-uuid');
    getRequestContextStub.args.should.eql([['visitor', 'new-uuid']]);
  });
});
