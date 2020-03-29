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
    const { text } = await supertest('localhost:3000')
      .get('/testGet?keyNumber=2')
      .expect(200);

    text.should.eql(JSON.stringify({}));
  });

  it('/testGet returns 400', async () => {
    const { text } = await supertest('localhost:3000')
      .get('/testGet?keyNumber=somestring')
      .expect(400);

    text.should.equal(JSON.stringify({ keyNumber: '"keyNumber" must be a number' }));
  });

  it('/testPost returns 200', async () => {
    const { text } = await supertest('localhost:3000')
      .post('/testPost')
      .send({ keyNumber: 2 })
      .expect(200);

    text.should.eql(JSON.stringify({ keyNumber: 2 }));
  });

  it('/testPost returns 400', async () => {
    const { text } = await supertest('localhost:3000')
      .post('/testPost')
      .send({ keyNumber: 'somestring' })
      .expect(400);

    text.should.equal(JSON.stringify({ keyNumber: '"keyNumber" must be a number' }));
  });
});
