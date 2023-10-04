import * as sinon from 'sinon';
import { runWithContext } from '../../build';

const sandbox = sinon.createSandbox();

describe('request-context', function () {
  let server;
  let testFunction;
  let clock;

  before(function () {
    process.env.LOG_LEVEL = 'info';
    process.env.LOG_JSON = 'true';
    delete process.env.NEW_RELIC_LICENSE_KEY;
  });

  after(function () {
    process.env.LOG_LEVEL = 'fatal';
    delete process.env.LOG_JSON;
    clock.restore();
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
    clock = sinon.useFakeTimers(new Date('2019-01-01'));
  });

  afterEach(function () {
    sandbox.restore();
  });

  const logEntry = (message, context) => [
    JSON.stringify({
      timestamp: '2019-01-01T00:00:00.000Z',
      severity: 'INFO',
      categoryName: 'initializing.log',
      message,
      context
    })
  ];

  it('it appends requestId to logs if runWithContext', async function () {
    const logSpy = sandbox.stub(console, 'log');
    await server.initTasks().then(testFunction);
    logSpy.args.should.eql([logEntry('A log in a service argument', { requestId: 'trace-id' })]);
  });
});
