import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { alsSupported } from '../../src/utils';
import * as nock from 'nock';

const sandbox = sinon.createSandbox();

describe('request-context', function() {
  let server;
  let clock;
  let request;
  const hasALS = alsSupported();

  before(function() {
    process.env.LOG_LEVEL = 'info';
    process.env.LOG_JSON = 'true';
    delete process.env.NEW_RELIC_LICENSE_KEY;
  });

  after(function() {
    process.env.LOG_LEVEL = 'fatal';
    delete process.env.LOG_JSON;
    if (server) server.stop();
    clock.restore();
  });

  before(async function() {
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
    request = supertest('localhost:2121');
    clock = sinon.useFakeTimers(new Date('2019-01-01'));
  });

  afterEach(function() {
    sandbox.restore();
  });

  const logEntry = (message, context) => [
    JSON.stringify({
      timestamp: '2019-01-01T00:00:00.000Z',
      severity: 'INFO',
      categoryName: 'log',
      message,
      context: hasALS ? context : {}
    })
  ];

  it('/log returns 200 and logs info with requestId', async function() {
    const logSpy = sandbox.stub(console, 'log');
    const response = await request
      .get('/log')
      .set('x-orka-request-id', 'test-id')
      .expect(200);
    response.text.should.eql('ok');
    logSpy.args.should.eql([
      logEntry('A log in controller, before service call', { requestId: 'test-id', afterMiddleware: 'orka' }),
      logEntry('A log in a service', { requestId: 'test-id', afterMiddleware: 'orka' }),
      logEntry('A log in controller, after service call', { requestId: 'test-id', afterMiddleware: 'orka' })
    ]);
  });

  it('/logWithAppendedRequestContextVar returns 200 and logs info with requestId and appended var', async function() {
    const logSpy = sandbox.stub(console, 'log');
    const response = await request
      .get('/logWithAppendedRequestContextVar?q=testme')
      .set('x-orka-request-id', 'test-id')
      .expect(200);
    response.text.should.eql('ok');
    logSpy.args.should.eql([
      logEntry('A log in a service', { requestId: 'test-id', query: 'testme', afterMiddleware: 'orka' })
    ]);
  });

  it('/propagateTracingHeaders returns 200 and propagate istio headers', async function() {
    const propagatedRequestMock = nock('http://foo.com')
      .matchHeader('x-request-id', 'istio-request-id')
      .matchHeader('x-b3-spanid', 'istio-x-b3-spanid')
      .post('/', (body) => true)
      .reply(200);

    const response = await request
      .post('/propagateTracingHeaders')
      .set('x-orka-request-id', 'test-id')
      .set('x-request-id', 'istio-request-id')
      .set('x-b3-spanid', 'istio-x-b3-spanid')
      .expect(200);

    response.text.should.eql('ok');
    propagatedRequestMock.isDone().should.be.true();
  });

  describe('header Propagation', function() {

    afterEach(function() {
      delete require.cache[require.resolve('../../examples/request-context-example/config.js')];
    });

    describe('when feature flag is off', function() {

      beforeEach(function() {
        const config = require('../../examples/request-context-example/config.js');
        config.requestContext.headerPropagation = { enabled: false };
      });

      it('should not propagate headers', async function() {
        const propagatedRequestMock = nock('http://foo.com')
          .post('/', (body) => true)
          .reply(200);

        await request
          .post('/propagateTracingHeaders')
          .set('cf-ray', 'header-value')
          .expect(200);

        propagatedRequestMock.isDone().should.be.true();
      });
    });

    it('/propagateTracingHeaders returns 200 and propagates whitelisted headers', async function() {
      const config = require('../../examples/request-context-example/config.js');
      config.requestContext.headerPropagation = { enabled: true, headers: ['header1', 'header2'] };

      const propagatedRequestMock = nock('http://foo.com')
        .matchHeader('header1', 'header-value')
        .matchHeader('header2', 'header2-value')
        .post('/', (body) => true)
        .reply(200);

      await request
        .post('/propagateTracingHeaders')
        .set('header1', 'header-value')
        .set('header2', 'header2-value')
        .set('header3', 'header3-value')
        .expect(200);

      propagatedRequestMock.isDone().should.be.true();
    });
  });
});
