import 'should';
import * as supertest from 'supertest';
import * as mockRequire from 'mock-require';
import { getLogger } from '../../build/initializers/log4js';
import * as sinon from 'sinon';

const sandbox = sinon.createSandbox();
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
  let loggerSpy;
  before(function () {
    mockRequire('newrelic', () => console.log('initialized newrelic'));
    mockRequire('tracer', () => console.log('initialized datadog tracer'));
    const logger = getLogger('orka');
    loggerSpy = sandbox.stub(logger, 'warn');
  });

  after(function () {
    sandbox.restore();
  });

  ws.forEach(function ([serverPath, name, setEnv]: [string, string, Function?]) {
    let server;
    describe('Example:' + name, function () {
      after(function () {
        deleteEnv();
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
        sandbox.reset();
      });

      it('/test returns ok', async function () {
        const { text } = await (supertest('localhost:3000') as any).get('/test').expect(200);
        text.should.eql('ok changed by prefix');
        const spyArgs = [];
        loggerSpy.args.should.eql(spyArgs);
      });

      it('/testPolicy returns 401', async function () {
        await (supertest('localhost:3000') as any).get('/testPolicy').expect(401);
      });

      it('/testPolicy returns 200', async function () {
        const { text } = await (supertest('localhost:3000') as any).get('/testPolicy?secret_key=success').expect(200);
        text.should.eql('ok changed by prefix');
      });
    });
  });
});
