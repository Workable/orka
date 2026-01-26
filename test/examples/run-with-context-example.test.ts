import { describe, it, before, after, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { runWithContext } from '../../build';

describe('request-context', function () {
  let server: any;
  let testFunction: any;

  before(function () {
    process.env.LOG_LEVEL = 'info';
    process.env.LOG_JSON = 'true';
    delete process.env.NEW_RELIC_LICENSE_KEY;
  });

  after(function () {
    process.env.LOG_LEVEL = 'fatal';
    delete process.env.LOG_JSON;
    mock.timers.reset();
  });

  before(async function () {
    const serverPath = '../../examples/run-with-context-example/app';
    delete require.cache[require.resolve('../../build/builder.js')];
    delete require.cache[require.resolve('../../build/index.js')];
    delete require.cache[require.resolve('../../build/orka-builder.js')];
    delete require.cache[require.resolve('../../build/orka.js')];
    delete require.cache[require.resolve('../../build/initializers/koa/add-visitor-id.js')];
    delete require.cache[require.resolve('../../build/initializers/log4js/index.js')];
    delete require.cache[require.resolve('../../build/initializers/log4js/json-appender.js')];
    delete require.cache[require.resolve(serverPath)];
    const mod = require(serverPath);
    server = mod.default;
    testFunction = mod.testFunction;
    mock.timers.enable({ apis: ['Date'], now: new Date('2019-01-01') });
  });

  afterEach(function () {
    mock.restoreAll();
  });

  const logEntry = (message: string, context: any) => [
    JSON.stringify({
      timestamp: '2019-01-01T00:00:00.000Z',
      severity: 'INFO',
      categoryName: 'initializing.log',
      message,
      context
    })
  ];

  it('it appends requestId to logs if runWithContext', async function () {
    const logSpy = mock.method(console, 'log');
    await server.initTasks().then(testFunction);
    assert.deepStrictEqual(
      logSpy.mock.calls.map(c => c.arguments),
      [logEntry('A log in a service argument', { requestId: 'trace-id' })]
    );
  });
});
