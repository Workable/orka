import 'should';
import * as supertest from 'supertest';

describe('Validation examples', () => {
  let server;
  after(async () => {
    if (server) await server.stop();
  });

  before(async () => {
    const serverPath = '../../examples/validation-example/app';
    delete require.cache[require.resolve(serverPath)];
    server = require(serverPath);
    await server.start();
  });

  it('/testGet returns 200', async () => {
    const { text } = await supertest('localhost:3210')
      .get('/testGet?keyNumber=2')
      .expect(200);

    text.should.eql(JSON.stringify({}));
  });

  it('/testGet returns 400', async () => {
    const { text } = await supertest('localhost:3210')
      .get('/testGet?keyNumber=somestring')
      .expect(400);

    text.should.equal(JSON.stringify({ keyNumber: '"keyNumber" must be a number' }));
  });

  it('/testPost returns 200', async () => {
    const { text } = await supertest('localhost:3210')
      .post('/testPost')
      .send({ keyNumber: 2 })
      .expect(200);

    text.should.eql(JSON.stringify({ keyNumber: 2 }));
  });

  it('/testPost returns 400', async () => {
    const { text } = await supertest('localhost:3210')
      .post('/testPost')
      .send({ keyNumber: 'somestring' })
      .expect(400);

    text.should.equal(JSON.stringify({ keyNumber: '"keyNumber" must be a number' }));
  });

  it('/testParams/:id/:name returns 200 with coerced params', async () => {
    const { body } = await supertest('localhost:3210')
      .get('/testParams/123/john')
      .expect(200);

    body.should.eql({ id: 123, name: 'john' });
  });

  it('/testParams/:id returns 200 with optional param missing', async () => {
    const { body } = await supertest('localhost:3210')
      .get('/testParams/456')
      .expect(200);

    body.should.eql({ id: 456 });
  });

  it('/testParams/:id returns 400 when id is not a number', async () => {
    const { text } = await supertest('localhost:3210')
      .get('/testParams/notanumber')
      .expect(400);

    text.should.equal(JSON.stringify({ id: '"id" must be a number' }));
  });
});
