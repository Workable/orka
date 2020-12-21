/// <reference types="../../src/typings/koa" />
import * as sinon from 'sinon';
import { Context } from 'koa';
import datadogMatchRoutes from '../../src/middlewares/datadog-match-routes';

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
        ['matchedRoute', '/api/foo/bar']
      ]);
    });
  });
});
