import 'should';
import * as supertest from 'supertest';
const ws = [require('../../examples/simple-example/app'), require('../../examples/builder-example/app')];

describe('examples', function() {
  ws.forEach(function(server) {
    describe('Example:' + server.name, function() {
      after(function() {
        server.stop();
      });

      before(function() {
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
