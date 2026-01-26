import { describe, it, before, after, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import { getLogger } from '../../build/initializers/log4js';

function deleteEnv() {
  delete process.env.NEW_RELIC_LICENSE_KEY;
  delete process.env.DD_SERVICE;
  delete process.env.DD_ENV;
}

const ws: [string, string, Function?][] = [
  ['../../examples/simple-example/app', 'simple-example'],
  ['../../examples/builder-example/app', 'builder-example'],
  ['../../examples/simple-example/app', 'simple-example newrelic', () => (process.env.NEW_RELIC_LICENSE_KEY = 'foo')],
  ['../../examples/builder-example/app', 'builder-example newrelic', () => (process.env.NEW_RELIC_LICENSE_KEY = 'foo')],
  ['../../examples/two-steps-example/app', 'two-steps-example'],
  [
    '../../examples/callback-example/app',
    'callback-example newrelic',
    () => (process.env.NEW_RELIC_LICENSE_KEY = 'foo')
  ],
  [
    '../../examples/simple-example/app',
    'simple-example datadog',
    () => {
      process.env.DD_SERVICE = 'service';
      process.env.DD_ENV = 'env';
    }
  ]
];

describe('examples', function () {
  let loggerSpy: ReturnType<typeof mock.method>;

  before(function () {
    // Module mocking for newrelic and dd-trace
    mock.module('newrelic', {
      defaultExport: () => console.log('initialized newrelic')
    });
    mock.module('dd-trace', {
      namedExports: {
        init: () => ({
          use: () => ({}),
          trace: (name: string, options: any, fn: Function) => fn(),
          scope: () => ({ active: () => ({ context: () => ({ _trace: { started: [{ setTag: mock.fn() }] } }) }) })
        })
      }
    });
    const logger = getLogger('orka');
    loggerSpy = mock.method(logger, 'warn');
  });

  after(function () {
    deleteEnv();
    mock.restoreAll();
  });

  ws.forEach(function ([serverPath, name, setEnv]: [string, string, Function?]) {
    let server: any;
    describe('Example:' + name, function () {
      after(function () {
        if (server) server.stop();
      });

      before(function () {
        delete require.cache[require.resolve(serverPath)];
        delete require.cache[require.resolve('mongoose')];
        delete require.cache[require.resolve('koa')];
        delete require.cache[require.resolve('amqplib')];
        delete require.cache[require.resolve('../../build/builder.js')];
        delete require.cache[require.resolve('../../build/index.js')];
        deleteEnv();
        if (setEnv) setEnv();
        server = require(serverPath);
        return server.start();
      });

      afterEach(function () {
        loggerSpy.mock.resetCalls();
      });

      it('/test returns ok', async function () {
        const { text } = await (supertest('localhost:3000') as any).get('/test').expect(200);
        assert.strictEqual(text, 'ok changed by prefix');
        assert.deepStrictEqual(loggerSpy.mock.calls.map(c => c.arguments), []);
      });

      it('/testPolicy returns 401', async function () {
        await (supertest('localhost:3000') as any).get('/testPolicy').expect(401);
      });

      it('/testPolicy returns 200', async function () {
        const { text } = await (supertest('localhost:3000') as any).get('/testPolicy?secret_key=success').expect(200);
        assert.strictEqual(text, 'ok changed by prefix');
      });
    });
  });
});
