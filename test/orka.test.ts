import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import OrkaBuilder from '../src/orka-builder';
import orka from '../src/orka';

describe('Orka', function() {
  let builderStub: any;

  beforeEach(function() {
    builderStub = {
      forTypescript: mock.fn(() => builderStub),
      use: mock.fn(() => builderStub),
      useDefaults: mock.fn(() => builderStub),
      withLogo: mock.fn(() => builderStub),
      withRabbitMQ: mock.fn(() => builderStub),
      withHoneyBadger: mock.fn(() => builderStub),
      withKafka: mock.fn(() => builderStub),
      withMongoDB: mock.fn(() => builderStub),
      withBull: mock.fn(() => builderStub),
      withPrometheus: mock.fn(() => builderStub),
      withRedis: mock.fn(() => builderStub),
      withPostgres: mock.fn(() => builderStub),
      loadGrowthbookFeatures: mock.fn(() => builderStub),
      with: mock.fn(() => builderStub),
      routes: mock.fn(() => builderStub),
    };
  });

  afterEach(function() {
    mock.restoreAll();
  });

  it('initializes orka', function() {
    const stub = mock.fn();
    orka({
      builder: builderStub,
      beforeMiddleware: stub,
      afterMiddleware: stub,
      logoPath: 'logoPath',
      rabbitOnConnected: stub,
      mongoOnConnected: stub,
      routesPath: 'routes'
    });

    assert.deepStrictEqual(builderStub.forTypescript.mock.calls.map((c: any) => c.arguments), [[false]]);
    assert.deepStrictEqual(builderStub.use.mock.calls.map((c: any) => c.arguments), [[stub], [stub]]);
    assert.deepStrictEqual(builderStub.useDefaults.mock.calls.map((c: any) => c.arguments), [[]]);
    assert.deepStrictEqual(builderStub.withLogo.mock.calls.map((c: any) => c.arguments), [['logoPath']]);
    assert.deepStrictEqual(builderStub.withRabbitMQ.mock.calls.map((c: any) => c.arguments), [[stub]]);
    assert.deepStrictEqual(builderStub.withHoneyBadger.mock.calls.map((c: any) => c.arguments), [[]]);
    assert.deepStrictEqual(builderStub.withKafka.mock.calls.map((c: any) => c.arguments), [[]]);
    assert.deepStrictEqual(builderStub.withMongoDB.mock.calls.map((c: any) => c.arguments), [[stub]]);
    assert.deepStrictEqual(builderStub.withRedis.mock.calls.map((c: any) => c.arguments), [[]]);
    assert.deepStrictEqual(builderStub.with.mock.calls.map((c: any) => c.arguments), [[[]]]);
    assert.deepStrictEqual(builderStub.routes.mock.calls.map((c: any) => c.arguments), [['routes']]);
  });
});
