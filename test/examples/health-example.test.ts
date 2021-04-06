import 'should';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';
import { getRabbit, close, isHealthy } from '../../build/initializers/rabbitmq/index';
import { getRedis } from '../../build/initializers/redis';
import { disconnectProducer } from '../../build/initializers/kafka/index';

describe('Health examples', () => {
  describe('MongoDb example', () => {
    let server;
    after(async () => {
      if (server) await server.stop();
      if (mongoose.connection) await mongoose.connection.close();
      delete require.cache[require.resolve('../../build/initializers/mongodb')];
      delete require.cache[require.resolve('../../build/middlewares/health')];
      delete require.cache[require.resolve('../../build/middlewares/index')];
      delete require.cache[require.resolve('../../build/orka-builder.js')];
      delete require.cache[require.resolve('../../build')];
    });

    before(async () => {
      const serverPath = '../../examples/mongodb-example/app';
      delete require.cache[require.resolve(serverPath)];
      server = require(serverPath);
      await server.start();
      await new Promise(t => setTimeout(t, 1000));
    });

    it('/health returns ok', async () => {
      await supertest('localhost:3210').get('/health').expect(200);
    });

    it('/health returns not ok', async () => {
      if (mongoose.connection) await mongoose.connection.close();
      await supertest('localhost:3210').get('/health').expect(503);
    });
  });

  describe('RabbitMQ example', () => {
    let server;
    after(async () => {
      if (server) await server.stop();
      if (isHealthy()) await close();
      delete require.cache[require.resolve('../../build/initializers/rabbitmq')];
      delete require.cache[require.resolve('../../build/middlewares/health')];
      delete require.cache[require.resolve('../../build/middlewares/index')];
      delete require.cache[require.resolve('../../build/orka-builder.js')];
      delete require.cache[require.resolve('../../build')];
    });

    before(async () => {
      const serverPath = '../../examples/rabbitmq-example/app';
      delete require.cache[require.resolve(serverPath)];
      server = require(serverPath);
      await server.start();
      await getRabbit().connected;
    });

    it('/health returns ok', async () => {
      await supertest('localhost:3000').get('/health').expect(200);
    });

    it('/health returns not ok', async () => {
      await close();
      await supertest('localhost:3000').get('/health').expect(503);
    });
  });

  describe('Redis example', () => {
    let server;
    after(async () => {
      if (server) await server.stop();
      delete require.cache[require.resolve('../../build/initializers/redis')];
      delete require.cache[require.resolve('../../build/middlewares/health')];
      delete require.cache[require.resolve('../../build/middlewares/index')];
      delete require.cache[require.resolve('../../build/orka-builder.js')];
      delete require.cache[require.resolve('../../build')];
      delete process.env.HEALTH_CHECK_REDIS;
    });

    before(async () => {
      const serverPath = '../../examples/redis-example/app';
      delete require.cache[require.resolve(serverPath)];
      process.env.HEALTH_CHECK_REDIS = 'true';
      server = require(serverPath);
      await server.start();
    });

    it('/health returns ok', async () => {
      await supertest('localhost:3210').get('/health').expect(200);
    });

    it('/health returns not ok', async () => {
      getRedis().end(true);
      await supertest('localhost:3210').get('/health').expect(503);
    });
  });

  describe('Kafka example', function () {
    let server;
    after(async () => {
      if (process.env.SKIP_SEMAPHORE) return;
      if (server) await server.stop();
      delete require.cache[require.resolve('../../build/initializers/kafka')];
      delete require.cache[require.resolve('../../build/middlewares/health')];
      delete require.cache[require.resolve('../../build/middlewares/index')];
      delete require.cache[require.resolve('../../build/orka-builder.js')];
      delete require.cache[require.resolve('../../build')];
      delete process.env.HEALTH_CHECK_KAFKA;
      delete process.env.NODE_ENV;
    });

    before(async () => {
      if (process.env.SKIP_SEMAPHORE) return;
      const serverPath = '../../examples/kafka-example/app';
      delete require.cache[require.resolve(serverPath)];
      process.env.HEALTH_CHECK_KAFKA = 'true';
      process.env.NODE_ENV = 'test';
      server = require(serverPath);
      await server.start();
      await new Promise(t => setTimeout(t, 1000));
    });

    it('/health returns ok', async () => {
      if (process.env.SKIP_SEMAPHORE) return;
      await supertest('localhost:3000').get('/health').expect(200);
    });

    it('/health returns not ok', async () => {
      if (process.env.SKIP_SEMAPHORE) return;
      await disconnectProducer();
      await supertest('localhost:3000').get('/health').expect(503);
    });
  });
});
