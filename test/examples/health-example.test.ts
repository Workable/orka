import 'should';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';

describe('MongoDb example', function() {
  let server;
  after(async function() {
    if (server) await server.stop();
    if (mongoose.connection) await mongoose.connection.close();
  });

  before(async function() {
    const serverPath = '../../examples/mongodb-example/app';
    delete require.cache[require.resolve(serverPath)];
    server = require(serverPath);
    await server.start();
  });

  it('/health returns ok', async function() {
    await supertest('localhost:3210')
      .get('/health')
      .expect(200);
  });

  it('/health returns not ok', async function() {
    if (mongoose.connection) await mongoose.connection.close();
    await supertest('localhost:3210')
      .get('/health')
      .expect(503);
  });
});
