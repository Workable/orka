import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { getMockCallArgs } from '../../helpers/assert-helpers';

describe('add-visitor-id', function () {
  let ctx: any, middleware: any, visitorWrapper: any, getRequestContextStub: any;
  const visitor = '883b16f6-b589-4786-a1fb-4f53ed38d5cf';
  const config = {
    visitor: {
      cookie: 'wmc'
    }
  };

  beforeEach(async function () {
    getRequestContextStub = mock.fn();

    mock.module('uuid', {
      namedExports: {
        v4: () => 'new-uuid'
      }
    });

    mock.module('../../src/builder', {
      namedExports: {
        getRequestContext: () => ({ set: getRequestContextStub })
      }
    });

    ctx = {
      origin: 'https://apply.workable.com/foo',
      state: {},
      cookies: {
        get: () => encodeURIComponent(JSON.stringify({ cookie_id: visitor }))
      }
    } as any;

    delete require.cache[require.resolve('../../../src/initializers/koa/add-visitor-id')];
    visitorWrapper = (await import('../../../src/initializers/koa/add-visitor-id')).default;
    middleware = visitorWrapper(config);
  });

  afterEach(function () {
    mock.restoreAll();
  });

  it('sets visitor cookie to state and to requestContext', async function () {
    // Prepare
    const next = mock.fn();

    // Execute
    await middleware(ctx, next);

    // Assert
    assert.strictEqual(next.mock.calls.length, 1);
    assert.strictEqual(ctx.state.visitor, visitor);
    assert.deepStrictEqual(getMockCallArgs(getRequestContextStub), [['visitor', visitor]]);
  });

  it('skips visitor setting if it is /health', async function () {
    // Prepare
    const next = mock.fn();
    ctx.path = '/health';

    // Execute
    await middleware(ctx, next);

    // Assert
    assert.strictEqual(next.mock.calls.length, 1);
    assert.strictEqual(ctx.state.visitor, undefined);
  });

  it('calls next if failed to decode', async function () {
    // Prepare
    const next = mock.fn();
    ctx.cookies.get = () => 'foobar';

    // Execute
    await middleware(ctx, next);

    // Assert
    assert.strictEqual(next.mock.calls.length, 1);
    assert.strictEqual(ctx.state.visitor, undefined);
  });

  it('sets new cookie if cookie not exists and setCookie=true', async function () {
    // Prepare
    const next = mock.fn();
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
    ctx.cookies.set = mock.fn();

    // Execute
    await middleware(ctx, next);

    // Assert
    assert.strictEqual(next.mock.calls.length, 1);
    assert.deepStrictEqual(getMockCallArgs(ctx.cookies.set), [[
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
    assert.strictEqual(ctx.state.visitor, 'new-uuid');
    assert.deepStrictEqual(getMockCallArgs(getRequestContextStub), [['visitor', 'new-uuid']]);
  });

  it('sets new cookie and overrides cookie domain', async function () {
    // Prepare
    const next = mock.fn();
    middleware = visitorWrapper({
      ...config,
      visitor: {
        ...config.visitor,
        setCookie: true,
        maxAge: '1d',
        secure: true,
        getCookieDomain: (ctx: any) => ctx.state.cookieDomain
      }
    });
    ctx.state.cookieDomain = '.facebook.com';
    ctx.cookies.get = () => undefined;
    ctx.cookies.set = mock.fn();

    // Execute
    await middleware(ctx, next);

    // Assert
    assert.strictEqual(next.mock.calls.length, 1);
    assert.deepStrictEqual(getMockCallArgs(ctx.cookies.set), [[
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
    assert.strictEqual(ctx.state.visitor, 'new-uuid');
    assert.deepStrictEqual(getMockCallArgs(getRequestContextStub), [['visitor', 'new-uuid']]);
  });
});
