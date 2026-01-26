import { describe, it, before, after, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { pickBy } from 'lodash';
import supertest from 'supertest';

describe('json-appender', function () {
  let server: any;

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

  before(function () {
    const serverPath = '../../examples/simple-example/app';
    delete require.cache[require.resolve(serverPath)];
    server = require(serverPath);
    mock.timers.enable({ apis: ['Date'], now: new Date('2019-01-01') });
    return server.start();
  });

  afterEach(function () {
    mock.restoreAll();
  });

  it('/log returns 200 and logs info', async function () {
    const logSpy = mock.method(console, 'log');
    const { text } = await (supertest('localhost:3000') as any)
      .get('/log?')
      .set('x-orka-request-id', 'test-id')
      .expect(200);
    assert.strictEqual(text, 'logged');
    assert.deepStrictEqual(logSpy.mock.calls.map(c => c.arguments), [
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
    const logSpy = mock.method(console, 'log');
    const { text } = await (supertest('localhost:3000') as any)
      .get('/logError')
      .set('x-orka-request-id', 'test-id')
      .expect(505);
    assert.strictEqual(text, 'default body');
    const cleanStack = (msg: string) => {
      const stack = JSON.parse(msg);
      stack.stack_trace = stack.stack_trace.substring(0, 29);
      return stack;
    };
    assert.deepStrictEqual(
      logSpy.mock.calls.map(c => (c.arguments as string[]).map(cleanStack)),
      [
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
              (_: any) => _ !== undefined
            )
          }
        ]
      ]
    );
  });

  it('should log a message if the log level is WARN and the first element of the logEvent data is an error object', async function () {
    const logSpy = mock.method(console, 'log');
    const { text } = await (supertest('localhost:3000') as any)
      .get('/logWarning')
      .set('x-orka-request-id', 'test-id')
      .expect(505);
    assert.strictEqual(text, 'default body');
    const cleanStack = (msg: string) => {
      const stack = JSON.parse(msg);
      stack.stack_trace = stack.stack_trace?.substring(0, 31);
      return stack;
    };
    assert.deepStrictEqual(
      logSpy.mock.calls.map(c => (c.arguments as string[]).map(cleanStack)),
      [
        [
          {
            timestamp: '2019-01-01T00:00:00.000Z',
            severity: 'WARN',
            categoryName: 'log',
            message: 'test - this was a test warning',
            stack_trace: 'Error: test\n    at /logWarning ',
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
            stack_trace: 'Error: test\n    at /logWarning ',
            context: pickBy(
              {
                expose: false,
                statusCode: 505,
                status: 505,
                component: 'koa',
                action: '/logWarning',
                params: { path: {}, query: {}, body: {}, requestId: 'test-id' },
                propagatedHeaders: { 'x-orka-request-id': 'test-id' },
                state: { riviereStartedAt: 1546300800000, requestId: 'test-id' },
                requestId: 'test-id'
              },
              (_: any) => _ !== undefined
            )
          }
        ]
      ]
    );
  });
});
