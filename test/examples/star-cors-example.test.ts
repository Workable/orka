import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';

describe('Star CORS examples', () => {
  let server: any;
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

    assert.strictEqual(response.headers['access-control-allow-origin'], '*');
  });

  it('/health/ returns access-control-allow-origin localhost:3000', async () => {
    const response = await supertest('localhost:3000')
      .get('/health')
      .expect(200);

    assert.strictEqual(response.headers['access-control-allow-origin'], 'http://localhost:3000');
  });

  it('/api triggers cors policy', async () => {
    const response = await supertest('localhost:3000')
      .get('/api')
      .set('origin', 'http://lvh.me.foreign.com')
      .expect(200);

    assert.notStrictEqual(response.headers['access-control-allow-origin'], 'http://lvh.me.foreign.com');
    assert.strictEqual(response.headers['access-control-allow-origin'], 'localhost:3000');
  });

  it('/api/example returns access-control-allow-origin that contains the subdomain', async () => {
    const response = await supertest('localhost:3000')
      .get('/api/example')
      .set('origin', 'http://some.localhost:3000')
      .expect(200);

    assert.strictEqual(response.headers['access-control-allow-origin'], 'http://some.localhost:3000');
  });

  it('/api/example blocks deep subdomains', async () => {
    const response = await supertest('localhost:3000')
      .get('/api/example')
      .set('origin', 'http://some.very.deep.subdomain.localhost:3000')
      .expect(200);

    assert.strictEqual(response.headers['access-control-allow-origin'], 'localhost:3000');
  });

  it('/api/example allows deep subdomains when the allowed origin is \'*.lvh.me\'', async () => {
    const response = await supertest('localhost:3000')
      .get('/api/example')
      .set('origin', 'https://some.very.deep.subdomain.lvh.me')
      .expect(200);

    assert.strictEqual(response.headers['access-control-allow-origin'], 'https://some.very.deep.subdomain.lvh.me');
  });
});
