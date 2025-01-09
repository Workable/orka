/// <reference types="../../src/typings/koa" />
import * as sinon from 'sinon';
import { Context } from 'koa';
import datadogMatchRoutes from '../../src/middlewares/datadog-match-routes';
import * as datadog from '../../src/initializers/datadog/index';

const sandbox = sinon.createSandbox();
describe('Datadog match routes middleware', function () {
  afterEach(function () {
    sandbox.restore();
  });

  describe('Dadatog not enabled', function () {
    it('runs next', async function () {
      const ctx = {} as Context;
      const next = sandbox.stub();
      await datadogMatchRoutes(ctx, next);
      next.called.should.be.true();
      ctx.should.eql({});
    });
  });

  describe('Datadog enabled', function () {
    before(function () {
      process.env.DD_SERVICE = 'true';
      process.env.DD_ENV = 'true';
    });

    after(function () {
      delete process.env.DD_SERVICE;
      delete process.env.DD_ENV;
    });

    it('calls ddSpan', async function () {
      const stub = sandbox.stub();
      const ctx = ({
        req: { _datadog: { span: { setTag: stub } } },
        request: { method: 'GET' },
        _matchedRoute: '/api/foo/bar'
      } as unknown) as Context;
      const next = sandbox.stub();
      await datadogMatchRoutes(ctx, next);
      ctx.should.eql({
        req: { _datadog: { span: { setTag: stub } } },
        request: { method: 'GET' },
        _matchedRoute: '/api/foo/bar'
      });
      next.called.should.be.true();
      stub.args.should.eql([
        ['resource.name', 'GET /api/foo/bar'],
        ['matchedRoute', '/api/foo/bar'],
        ['params', undefined]
      ]);
    });

    it('calls ddSpan from tracer', async function () {
      const stub = sandbox.stub();
      const tracerStub = {
        scope: sandbox.stub().returns({
          active: sandbox.stub().returns({
            context: sandbox.stub().returns({ _trace: { started: [{ setTag: stub }] } })
          })
        })
      };
      sandbox.stub(datadog, 'getDatadogTracer').returns(tracerStub as any);
      const ctx = ({
        request: { method: 'GET' },
        _matchedRoute: '/api/foo/bar'
      } as unknown) as Context;
      const next = sandbox.stub();

      await datadogMatchRoutes(ctx, next);

      ctx.should.eql({
        request: { method: 'GET' },
        _matchedRoute: '/api/foo/bar'
      });
      next.called.should.be.true();
      stub.args.should.eql([
        ['resource.name', 'GET /api/foo/bar'],
        ['matchedRoute', '/api/foo/bar'],
        ['params', undefined]
      ]);
    });
  });
});
