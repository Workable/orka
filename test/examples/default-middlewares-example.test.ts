import * as should from 'should';
import * as supertest from 'supertest';
import * as uuid from 'uuid';

describe('Default middlewares examples', () => {
  let server;
  after(async () => {
    if (server) await server.stop();
  });

  before(async () => {
    const serverPath = '../../examples/default-middlewares-example/app';
    delete require.cache[require.resolve(serverPath)];
    server = require(serverPath);
    await server.start();
    await new Promise(t => setTimeout(t, 1000));
  });

  describe('add-visitor-id middleware', function() {
    it('/test sets a visitor cookie', async () => {
      const response = await supertest('localhost:3220')
        .get('/test')
        .expect(200);

      const cookies = response.headers['set-cookie'];
      should(cookies).not.be.undefined();

      const visitorCookie = cookies.find(cookie => cookie.startsWith('wmc='));
      should(visitorCookie).not.be.undefined();
      visitorCookie.should.match(/domain=localhost/i);
      visitorCookie.should.match(/secure/i);
      visitorCookie.should.match(/samesite=none/i);

      const [, encoded] = visitorCookie.split(';')[0].split('=');
      const decoded = JSON.parse(decodeURIComponent(encoded));
      uuid.validate(decoded.cookie_id).should.be.true();
    });

    it('/test reuses the visitor cookie when already present', async () => {
      const visitor = uuid.v4();
      const cookie = encodeURIComponent(JSON.stringify({ cookie_id: visitor }));

      const response = await supertest('localhost:3220')
        .get('/test')
        .set('Cookie', `wmc=${cookie}`)
        .expect(200);

      should(response.headers['set-cookie']).be.undefined();
    });

    describe('when origin header is invalid', function() {
      it('/test sets a visitor cookie', async () => {
        const response = await supertest('localhost:3220')
          .get('/test')
          .set('origin', 'invalid')
          .expect(200);

        const cookies = response.headers['set-cookie'];
        should(cookies).not.be.undefined();

        const visitorCookie = cookies.find(cookie => cookie.startsWith('wmc='));
        should(visitorCookie).not.be.undefined();
        visitorCookie.should.match(/domain=localhost/i);
        visitorCookie.should.match(/secure/i);
        visitorCookie.should.match(/samesite=none/i);

        const [, encoded] = visitorCookie.split(';')[0].split('=');
        const decoded = JSON.parse(decodeURIComponent(encoded));
        uuid.validate(decoded.cookie_id).should.be.true();
      });
    });

    describe('when callback for cookie domain is provided from config', function() {
      let origConfig;
      before(function() {
        origConfig = server.config.visitor;
        server.config.visitor.getCookieDomain = () => 'domain-provider-cb';
      });

      after(function() {
        server.config.visitor = origConfig;
      });

      it('uses the callback to set a visitor cookie domain', async () => {
        const response = await supertest('localhost:3220')
          .get('/test')
          .set('origin', 'invalid')
          .expect(200);

        const cookies = response.headers['set-cookie'];
        should(cookies).not.be.undefined();

        const visitorCookie = cookies.find(cookie => cookie.startsWith('wmc='));
        should(visitorCookie).not.be.undefined();
        visitorCookie.should.match(/domain=domain-provider-cb/i);
        visitorCookie.should.match(/secure/i);
        visitorCookie.should.match(/samesite=none/i);

        const [, encoded] = visitorCookie.split(';')[0].split('=');
        const decoded = JSON.parse(decodeURIComponent(encoded));
        uuid.validate(decoded.cookie_id).should.be.true();
      });

      it('precedes the origin header uses the callback to set a visitor cookie', async () => {
        const response = await supertest('localhost:3220')
          .get('/test')
          .set('origin', 'http://localhost:3220')
          .expect(200);

        const cookies = response.headers['set-cookie'];
        should(cookies).not.be.undefined();

        const visitorCookie = cookies.find(cookie => cookie.startsWith('wmc='));
        should(visitorCookie).not.be.undefined();
        visitorCookie.should.match(/domain=domain-provider-cb/i);
        visitorCookie.should.match(/secure/i);
        visitorCookie.should.match(/samesite=none/i);

        const [, encoded] = visitorCookie.split(';')[0].split('=');
        const decoded = JSON.parse(decodeURIComponent(encoded));
        uuid.validate(decoded.cookie_id).should.be.true();
      });
    });
  });
});
