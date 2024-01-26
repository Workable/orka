import 'should';
import * as supertest from 'supertest';

describe('Star CORS examples', () => {
  let server;
  after(async () => {
    if (server) await server.stop();
  });

  before(async () => {
    const serverPath = '../../examples/simple-example/app';
    delete require.cache[require.resolve(serverPath)];
    server = require(serverPath);
    await server.start();
    await new Promise(t => setTimeout(t, 1000));
  });

  it('/api/allowAll/ returns access-control-allow-origin *', async () => {
    const response = await supertest('localhost:3000')
      .get('/api/allowAll/accounts/banana')
      .expect(200);

    response.headers['access-control-allow-origin'].should.eql('*');
  });
  it('/health/ returns access-control-allow-origin localhost:3000', async () => {
    const response = await supertest('localhost:3000')
      .get('/health')
      .expect(200);

    response.headers['access-control-allow-origin'].should.eql('http://localhost:3000');
  });

  it('/api triggers cors policy', async () => {
    const response = await supertest('localhost:3000')
      .get('/api')
      .set('origin', 'http://lvh.me.foreign.com')
      .expect(200);

    response.headers['access-control-allow-origin'].should.not.eql('http://lvh.me.foreign.com');
    response.headers['access-control-allow-origin'].should.eql('localhost:3000');
  });

  it('/api/example returns access-control-allow-origin that contains the subdomain', async () => {
    const response = await supertest('localhost:3000')
      .get('/api/example')
      .set('origin', 'http://some.localhost:3000')
      .expect(200);

    response.headers['access-control-allow-origin'].should.eql('http://some.localhost:3000');
  });

  it('/api/example blocks deep subdomains', async () => {
    const response = await supertest('localhost:3000')
      .get('/api/example')
      .set('origin', 'http://some.very.deep.subdomain.localhost:3000')
      .expect(200);

    response.headers['access-control-allow-origin'].should.eql('localhost:3000');
  });
});
