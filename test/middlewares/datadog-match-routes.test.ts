/// <reference types="../../src/typings/koa" />
import { describe, it, before, after, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { Context } from 'koa';
import { getMockCallArgs } from '../helpers/assert-helpers';

describe('Datadog match routes middleware', function () {
  afterEach(function () {
    mock.restoreAll();
  });

  describe('Dadatog not enabled', function () {
    let datadogMatchRoutes: any;

    beforeEach(async function () {
      mock.module('../../src/initializers/datadog/index', {
        namedExports: {
          getDatadogTracer: () => undefined
        }
      });

      delete require.cache[require.resolve('../../src/middlewares/datadog-match-routes')];
      datadogMatchRoutes = (await import('../../src/middlewares/datadog-match-routes')).default;
    });

    it('runs next', async function () {
      const ctx = {} as Context;
      const next = mock.fn();
      await datadogMatchRoutes(ctx, next);
      assert.strictEqual(next.mock.calls.length, 1);
      assert.deepStrictEqual(ctx, {});
    });
  });

  describe('Datadog enabled', function () {
    let datadogMatchRoutes: any;

    before(function () {
      process.env.DD_SERVICE = 'true';
      process.env.DD_ENV = 'true';
    });

    after(function () {
      delete process.env.DD_SERVICE;
      delete process.env.DD_ENV;
    });

    beforeEach(async function () {
      delete require.cache[require.resolve('../../src/middlewares/datadog-match-routes')];
      datadogMatchRoutes = (await import('../../src/middlewares/datadog-match-routes')).default;
    });

    it('calls ddSpan', async function () {
      const stub = mock.fn();
      const ctx = ({
        req: { _datadog: { span: { setTag: stub } } },
        request: { method: 'GET' },
        _matchedRoute: '/api/foo/bar'
      } as unknown) as Context;
      const next = mock.fn();
      await datadogMatchRoutes(ctx, next);
      assert.deepStrictEqual(ctx, {
        req: { _datadog: { span: { setTag: stub } } },
        request: { method: 'GET' },
        _matchedRoute: '/api/foo/bar'
      });
      assert.strictEqual(next.mock.calls.length, 1);
      assert.deepStrictEqual(getMockCallArgs(stub), [
        ['resource.name', 'GET /api/foo/bar'],
        ['matchedRoute', '/api/foo/bar'],
        ['params', undefined]
      ]);
    });

    it('calls ddSpan from tracer', async function () {
      const stub = mock.fn();
      const contextStub = mock.fn(() => ({ _trace: { started: [{ setTag: stub }] } }));
      const activeStub = mock.fn(() => ({
        context: contextStub
      }));
      const tracerStub = {
        scope: mock.fn(() => ({
          active: activeStub
        }))
      };

      mock.module('../../src/initializers/datadog/index', {
        namedExports: {
          getDatadogTracer: () => tracerStub
        }
      });

      delete require.cache[require.resolve('../../src/middlewares/datadog-match-routes')];
      datadogMatchRoutes = (await import('../../src/middlewares/datadog-match-routes')).default;

      const ctx = ({
        request: { method: 'GET' },
        _matchedRoute: '/api/foo/bar'
      } as unknown) as Context;
      const next = mock.fn();

      await datadogMatchRoutes(ctx, next);

      assert.deepStrictEqual(ctx, {
        request: { method: 'GET' },
        _matchedRoute: '/api/foo/bar'
      });
      assert.strictEqual(next.mock.calls.length, 1);
      assert.deepStrictEqual(getMockCallArgs(stub), [
        ['resource.name', 'GET /api/foo/bar'],
        ['matchedRoute', '/api/foo/bar'],
        ['params', undefined]
      ]);
    });
  });
});
