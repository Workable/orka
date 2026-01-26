import { describe, it, before, after, afterEach, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import nock from 'nock';

describe('request-context', function () {
  let server: any;
  let request: supertest.Agent;

  before(function () {
    process.env.LOG_LEVEL = 'info';
    process.env.LOG_JSON = 'true';
    delete process.env.NEW_RELIC_LICENSE_KEY;
  });

  after(function () {
    process.env.LOG_LEVEL = 'fatal';
    delete process.env.LOG_JSON;
    if (server) server.stop();
    mock.timers.reset();
  });

  before(async function () {
    const serverPath = '../../examples/request-context-example/app';
    delete require.cache[require.resolve('../../build/builder.js')];
    delete require.cache[require.resolve('../../build/index.js')];
    delete require.cache[require.resolve('../../build/orka-builder.js')];
    delete require.cache[require.resolve('../../build/orka.js')];
    delete require.cache[require.resolve('../../build/initializers/koa/add-visitor-id.js')];
    delete require.cache[require.resolve('../../build/initializers/log4js/index.js')];
    delete require.cache[require.resolve('../../build/initializers/log4js/json-appender.js')];
    delete require.cache[require.resolve('../../build/initializers/riviere.js')];
    delete require.cache[require.resolve(serverPath)];
    server = require(serverPath);
    await server.start();
    request = supertest('localhost:2121') as any;
    mock.timers.enable({ apis: ['Date'], now: new Date('2019-01-01') });
  });

  afterEach(function () {
    mock.restoreAll();
  });

  const logEntry = (message: string, context: any) => {
    context.propagatedHeaders = { 'x-orka-request-id': 'test-id' };
    return [
      JSON.stringify({
        timestamp: '2019-01-01T00:00:00.000Z',
        severity: 'INFO',
        categoryName: 'log',
        message,
        context
      })
    ];
  };

  it('/log returns 200 and logs info with requestId', async function () {
    const logSpy = mock.method(console, 'log');
    const response = await request.get('/log').set('x-orka-request-id', 'test-id').expect(200);
    assert.strictEqual(response.text, 'ok');
    assert.deepStrictEqual(logSpy.mock.calls.map(c => c.arguments), [
      logEntry('A log in controller, before service call', { requestId: 'test-id', afterMiddleware: 'orka' }),
      logEntry('A log in a service', { requestId: 'test-id', afterMiddleware: 'orka' }),
      logEntry('A log in controller, after service call', { requestId: 'test-id', afterMiddleware: 'orka' })
    ]);
  });

  it('/logWithAppendedRequestContextVar returns 200 and logs info with requestId and appended var', async function () {
    const logSpy = mock.method(console, 'log');
    const response = await request
      .get('/logWithAppendedRequestContextVar?q=testme')
      .set('x-orka-request-id', 'test-id')
      .expect(200);
    assert.strictEqual(response.text, 'ok');
    assert.deepStrictEqual(logSpy.mock.calls.map(c => c.arguments), [
      logEntry('A log in a service', { requestId: 'test-id', query: 'testme', afterMiddleware: 'orka' })
    ]);
  });

  it('/propagateTracingHeaders returns 200 and propagate istio headers', async function () {
    const propagatedRequestMock = nock('http://foo.com')
      .matchHeader('x-request-id', 'istio-request-id')
      .matchHeader('x-b3-spanid', 'istio-x-b3-spanid')
      .post('/', () => true)
      .reply(200);

    const response = await request
      .post('/propagateTracingHeaders')
      .set('x-orka-request-id', 'test-id')
      .set('x-request-id', 'istio-request-id')
      .set('x-b3-spanid', 'istio-x-b3-spanid')
      .expect(200);

    assert.strictEqual(response.text, 'ok');
    assert.strictEqual(propagatedRequestMock.isDone(), true);
  });

  describe('header Propagation', function () {
    afterEach(function () {
      delete require.cache[require.resolve('../../examples/request-context-example/config.js')];
    });

    describe('when feature flag is off', function () {
      beforeEach(function () {
        const config = require('../../examples/request-context-example/config.js');
        config.requestContext.propagatedHeaders = { enabled: false };
      });

      it('should not propagate headers', async function () {
        const propagatedRequestMock = nock('http://foo.com')
          .post('/', () => true)
          .reply(200);

        await request.post('/propagateTracingHeaders').set('cf-ray', 'header-value').expect(200);

        assert.strictEqual(propagatedRequestMock.isDone(), true);
      });
    });

    it('/propagateTracingHeaders returns 200 and propagates whitelisted headers', async function () {
      const config = require('../../examples/request-context-example/config.js');
      config.requestContext.propagatedHeaders = { enabled: true, headers: ['header1', 'header2'] };

      const propagatedRequestMock = nock('http://foo.com')
        .matchHeader('header1', 'header-value')
        .matchHeader('header2', 'header2-value')
        .post('/', () => true)
        .reply(200);

      await request
        .post('/propagateTracingHeaders')
        .set('header1', 'header-value')
        .set('header2', 'header2-value')
        .set('header3', 'header3-value')
        .expect(200);

      assert.strictEqual(propagatedRequestMock.isDone(), true);
    });
  });
});
