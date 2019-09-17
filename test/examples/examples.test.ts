import 'should';
import * as supertest from 'supertest';
import * as mockRequire from 'mock-require';
import * as path from 'path';

const ws: [string, string, Function?][] = [
  ['../../examples/simple-example/app', 'simple-example', () => delete process.env.NEW_RELIC_LICENSE_KEY],
  ['../../examples/builder-example/app', 'builder-example', () => delete process.env.NEW_RELIC_LICENSE_KEY],
  ['../../examples/simple-example/app', 'simple-example newrelic', () => (process.env.NEW_RELIC_LICENSE_KEY = 'foo')],
  ['../../examples/builder-example/app', 'builder-example newrelic', () => (process.env.NEW_RELIC_LICENSE_KEY = 'foo')],
  [
    '../../examples/simple-example-two-steps/app',
    'simple-example-two-steps newrelic',
    () => process.env.NEW_RELIC_LICENSE_KEY
  ]
];

describe('examples', function() {
  before(function() {
    mockRequire('newrelic', () => console.log('initialized newrelic'));
  });

  ws.forEach(function([serverPath, name, setEnv]: [string, string, Function?]) {
    let server;
    describe('Example:' + name, function() {
      after(function() {
        if (server) server.stop();
      });

      before(function() {
        delete require.cache[require.resolve(serverPath)];
        if (setEnv) setEnv();
        server = require(serverPath);
        server.start();
      });

      it('/test returns ok', async function() {
        const { text } = await (supertest('localhost:3000') as any).get('/test').expect(200);
        text.should.eql('ok changed by prefix');
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
