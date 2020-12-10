import * as sinon from 'sinon';
import { Context } from 'koa';
import 'should';
import metrics from '../../src/middlewares/metrics';
import * as prometheus from '../../src/index';
import * as bull from '../../src/index';
import OrkaBuilder from '../../src/orka-builder';

describe('Metrics middleware', function() {
  describe('Prometheus enabled', function() {
    const sandbox = sinon.createSandbox();
    let metricsSpy = sandbox.stub();
    let updateMetricsStub = sandbox.stub();
    beforeEach(function() {
      sandbox.stub(prometheus, 'getPrometheus').returns({ metrics: metricsSpy } as any);
      sandbox.stub(bull, 'getBull').returns({ updateMetrics: updateMetricsStub } as any);
    });
    afterEach(function() {
      sandbox.restore();
    });
    it('returns 200 when no bull is configured', async function() {
      const ctx = {} as Context;
      OrkaBuilder.INSTANCE = { config: { bull: '' } } as any;
      metricsSpy.returns({ metric: 1 });
      const next = sandbox.stub();
      await metrics(ctx, next);
      ctx.status.should.eql(200);
      ctx.body.metric.should.eql(1);
      next.called.should.be.true();
      updateMetricsStub.called.should.be.false();
    });
    it('returns 200 and calls bull update when bull is configured', async function() {
      const ctx = {} as Context;
      OrkaBuilder.INSTANCE = { config: { bull: {} } } as any;
      metricsSpy.returns({ metric: 1 });
      updateMetricsStub.resolves();
      const next = sandbox.stub();
      await metrics(ctx, next);
      ctx.status.should.eql(200);
      ctx.body.metric.should.eql(1);
      next.called.should.be.true();
      updateMetricsStub.called.should.be.true();
    });
  });

  describe('Prometheus not configured', function() {
    const sandbox = sinon.createSandbox();
    before(function() {
      sandbox.stub(prometheus, 'getPrometheus').returns(undefined);
    });
    after(function() {
      sandbox.restore();
    });
    it('returns 404', async function() {
      const ctx = {} as Context;
      OrkaBuilder.INSTANCE = { config: { bull: {} } } as any;
      const next = sandbox.stub();
      await metrics(ctx, next);
      ctx.status.should.eql(404);
      next.called.should.be.true();
    });
  });
});
