import 'should';
import * as supertest from 'supertest';
import * as mockRequire from 'mock-require';
import { getLogger } from '../../build/initializers/log4js';
import * as sinon from 'sinon';
import { alsSupported } from '../../src/utils';

const hasALS = alsSupported();
const sandbox = sinon.createSandbox();
const ws: [string, string, Function?][] = [
  ['../../examples/simple-example/app', 'simple-example', () => delete process.env.NEW_RELIC_LICENSE_KEY],
  ['../../examples/builder-example/app', 'builder-example', () => delete process.env.NEW_RELIC_LICENSE_KEY],
  ['../../examples/simple-example/app', 'simple-example newrelic', () => (process.env.NEW_RELIC_LICENSE_KEY = 'foo')],
  ['../../examples/builder-example/app', 'builder-example newrelic', () => (process.env.NEW_RELIC_LICENSE_KEY = 'foo')],
  ['../../examples/two-steps-example/app', 'two-steps-example', () => delete process.env.NEW_RELIC_LICENSE_KEY],
  [
    '../../examples/callback-example/app',
    'callback-example newrelic',
    () => (process.env.NEW_RELIC_LICENSE_KEY = 'foo')
  ]
];

describe('examples', function() {
  let loggerSpy;
  before(function() {
    mockRequire('newrelic', () => console.log('initialized newrelic'));
    const logger = getLogger('orka');
    loggerSpy = sandbox.stub(logger, 'warn');
  });

  after(function() {
    sandbox.restore();
  });

  ws.forEach(function([serverPath, name, setEnv]: [string, string, Function?]) {
    let server;
    describe('Example:' + name, function() {
      after(function() {
        if (server) server.stop();
      });

      before(function() {
        delete require.cache[require.resolve(serverPath)];
        delete require.cache[require.resolve('mongoose')];
        delete require.cache[require.resolve('koa')];
        delete require.cache[require.resolve('amqplib')];
        delete require.cache[require.resolve('../../build/builder.js')];
        delete require.cache[require.resolve('../../build/index.js')];
        if (setEnv) setEnv();
        server = require(serverPath);
        return server.start();
      });

      afterEach(function() {
        sandbox.reset();
      });

      it('/test returns ok', async function() {
        const { text } = await (supertest('localhost:3000') as any).get('/test').expect(200);
        text.should.eql('ok changed by prefix');
        const spyArgs = hasALS
          ? []
          : [
              [
                'RequestContext is disabled!! You need to have version v12.17.0+, v13.14.0+ or v14.0.0+ if you want to enable it.'
              ]
            ];
        loggerSpy.args.should.eql(spyArgs);
      });

      it('/testPolicy returns 401', async function() {
        await (supertest('localhost:3000') as any).get('/testPolicy').expect(401);
      });

      it('/testPolicy returns 200', async function() {
        const { text } = await (supertest('localhost:3000') as any).get('/testPolicy?secret_key=success').expect(200);
        text.should.eql('ok changed by prefix');
      });
    });
  });
});
