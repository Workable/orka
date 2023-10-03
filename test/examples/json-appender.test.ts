import { pickBy } from 'lodash';
import * as sinon from 'sinon';
import * as supertest from 'supertest';

const sandbox = sinon.createSandbox();

describe('json-appender', function () {
  let server;
  let clock;
  before(function () {
    process.env.LOG_LEVEL = 'info';
    process.env.LOG_JSON = 'true';
    delete process.env.NEW_RELIC_LICENSE_KEY;
  });

  after(function () {
    process.env.LOG_LEVEL = 'fatal';
    delete process.env.LOG_JSON;
    if (server) server.stop();
    clock.restore();
  });

  before(function () {
    const serverPath = '../../examples/simple-example/app';
    delete require.cache[require.resolve(serverPath)];
    server = require(serverPath);
    clock = sinon.useFakeTimers(new Date('2019-01-01'));
    return server.start();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('/log returns 200 and logs info', async function () {
    const logSpy = sandbox.stub(console, 'log');
    const { text } = await (supertest('localhost:3000') as any)
      .get('/log?')
      .set('x-orka-request-id', 'test-id')
      .expect(200);
    text.should.eql('logged');
    logSpy.args.should.eql([
      [
        JSON.stringify({
          timestamp: '2019-01-01T00:00:00.000Z',
          severity: 'INFO',
          categoryName: 'log',
          message: 'hello world',
          context: pickBy({
            requestId: 'test-id',
            propagatedHeaders: { 'x-orka-request-id': 'test-id' },
            context: 'foo'
          })
        })
      ]
    ]);
  });

  it('/logError returns 505 and logs error', async function () {
    const logSpy = sandbox.stub(console, 'log');
    const { text } = await (supertest('localhost:3000') as any)
      .get('/logError')
      .set('x-orka-request-id', 'test-id')
      .expect(505);
    text.should.eql('default body');
    const cleanStack = msg => {
      const stack = JSON.parse(msg);
      stack.stack_trace = stack.stack_trace.substring(0, 29);
      return stack;
    };
    logSpy.args
      .map(callArg => callArg.map(cleanStack))
      .should.eql([
        [
          {
            timestamp: '2019-01-01T00:00:00.000Z',
            severity: 'ERROR',
            categoryName: 'log',
            message: 'test - this was a test error',
            stack_trace: 'Error: test\n    at /logError ',
            context: pickBy({
              propagatedHeaders: { 'x-orka-request-id': 'test-id' },
              requestId: 'test-id',
              context: 'foo'
            })
          }
        ],
        [
          {
            timestamp: '2019-01-01T00:00:00.000Z',
            severity: 'ERROR',
            categoryName: 'orka.errorHandler',
            message: 'test',
            stack_trace: 'Error: test\n    at /logError ',
            context: pickBy(
              {
                expose: false,
                statusCode: 505,
                status: 505,
                component: 'koa',
                action: '/logError',
                params: { path: {}, query: {}, body: {}, requestId: 'test-id' },
                propagatedHeaders: { 'x-orka-request-id': 'test-id' },
                state: { riviereStartedAt: 1546300800000, requestId: 'test-id' },
                requestId: 'test-id'
              },
              _ => _ !== undefined
            )
          }
        ]
      ]);
  });
});
