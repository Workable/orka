import * as sinon from 'sinon';
import { Context } from 'koa';
import 'should';
import health from '../../src/middlewares/health';
import * as mongodb from '../../src/initializers/mongodb';
import * as rabbitmq from '../../src/initializers/rabbitmq';
import * as redis from '../../src/initializers/redis';
import * as kafka from '../../src/initializers/kafka/kafka';
import OrkaBuilder from '../../src/orka-builder';

const sandbox = sinon.createSandbox();

describe('Health middleware', function () {
  let getConnectionStub, isHealthyStub, isRedisHealthyStub, isKafkaHealthyStub;
  beforeEach(function () {
    getConnectionStub = sandbox.stub(mongodb, 'getConnection');
    isHealthyStub = sandbox.stub(rabbitmq, 'isHealthy');
    isRedisHealthyStub = sandbox.stub(redis, 'isHealthy');
    isKafkaHealthyStub = sandbox.stub(kafka, 'isHealthy');
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('returns 200 when mongo connection is ok and rabbitmq is healthy', async function () {
    const version = process.env.npm_package_version;
    process.env.npm_package_version = '2.44.0';
    const ctx = {} as Context;
    getConnectionStub.returns({ readyState: 1 });
    OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { redis: false } } } as any;
    isHealthyStub.returns(true);
    const next = sandbox.stub();
    await health(ctx, next);
    ctx.status.should.eql(200);
    ctx.body.version.should.eql('v2.44.0');
    ctx.body.env.should.eql('test');
    next.called.should.be.true();
    process.env.npm_package_version = version;
  });

  it('returns 503 when mongo connection is down', async function () {
    const ctx = {} as Context;
    OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { redis: false } } } as any;
    getConnectionStub.returns({ readyState: 2 });
    const next = sandbox.stub();
    await health(ctx, next);
    next.called.should.be.true();
    ctx.status.should.eql(503);
  });

  it('return 503 when rabbitmq is not healthy', async function () {
    const ctx = {} as Context;
    OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { redis: false } } } as any;
    getConnectionStub.returns({ readyState: 1 });
    isHealthyStub.returns(false);
    const next = sandbox.stub();
    await health(ctx, next);
    next.called.should.be.true();
    ctx.status.should.eql(503);
  });

  context('when config.healthCheck.redis: true', () => {
    it('returns 200 when mongo connection is ok and rabbitmq is healthy and redis is healthy', async function () {
      const version = process.env.npm_package_version;
      process.env.npm_package_version = '2.44.0';
      const ctx = {} as Context;
      getConnectionStub.returns({ readyState: 1 });
      OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { redis: true } } } as any;
      isHealthyStub.returns(true);
      isRedisHealthyStub.returns(true);
      const next = sandbox.stub();
      await health(ctx, next);
      ctx.status.should.eql(200);
      ctx.body.version.should.eql('v2.44.0');
      ctx.body.env.should.eql('test');
      next.called.should.be.true();
      process.env.npm_package_version = version;
    });

    it('return 503 when redis is not healthy', async function () {
      const ctx = {} as Context;
      getConnectionStub.returns({ readyState: 1 });
      isHealthyStub.returns(true);
      isRedisHealthyStub.returns(false);
      const next = sandbox.stub();
      await health(ctx, next);
      next.called.should.be.true();
      ctx.status.should.eql(503);
    });
  });

  context('when config.healthCheck.kafka: true', () => {
    it('returns 200 when mongo connection is ok and rabbitmq is healthy and kafka is healthy', async function () {
      const version = process.env.npm_package_version;
      process.env.npm_package_version = '2.44.0';
      const ctx = {} as Context;
      getConnectionStub.returns({ readyState: 1 });
      OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { kafka: true } } } as any;
      isHealthyStub.returns(true);
      isKafkaHealthyStub.returns(true);
      const next = sandbox.stub();
      await health(ctx, next);
      ctx.status.should.eql(200);
      ctx.body.version.should.eql('v2.44.0');
      ctx.body.env.should.eql('test');
      next.called.should.be.true();
      process.env.npm_package_version = version;
    });

    it('return 503 when kafka is not healthy', async function () {
      const ctx = {} as Context;
      getConnectionStub.returns({ readyState: 1 });
      OrkaBuilder.INSTANCE = { config: { nodeEnv: 'test', healthCheck: { kafka: true } } } as any;
      isHealthyStub.returns(true);
      isKafkaHealthyStub.returns(false);
      const next = sandbox.stub();
      await health(ctx, next);
      next.called.should.be.true();
      ctx.status.should.eql(503);
    });
  });
});
