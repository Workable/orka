const mock = require('mock-require');
import * as sinon from 'sinon';
import 'should';
import { cloneDeep } from 'lodash';

const sandbox = sinon.createSandbox();

describe('Redis connection', function() {
  const config = {
    url: 'redis://localhost:6379/',
    options: {
      sample: 'sample',
      tls: {
        ca: [],
        cert: '',
        key: ''
      }
    }
  };
  let redis;
  let createClientStub: sinon.SinonStub;
  let onStub: sinon.SinonStub;
  let connectStub: sinon.SinonStub;

  const createdOptions = () => createClientStub.args[0][0];
  const reconnectStrategy = () => createdOptions().socket.reconnectStrategy;
  const emit = (event: string, ...args) =>
    onStub.args.filter(([e]) => e === event).forEach(([, handler]) => handler(...args));

  beforeEach(async function() {
    onStub = sandbox.stub();
    connectStub = sandbox.stub().resolves();
    createClientStub = sandbox.stub().returns({ on: onStub, connect: connectStub });
    delete require.cache[require.resolve('../../src/initializers/redis')];
    mock('redis', { createClient: createClientStub });
    ({ createRedisConnection: redis } = await import('../../src/initializers/redis'));
  });

  afterEach(function() {
    sandbox.restore();
    mock.stopAll();
  });

  it('should connect to redis', async () => {
    await redis(config);
    delete createdOptions().socket.reconnectStrategy;
    createClientStub.args.should.eql([
      [
        {
          url: 'redis://localhost:6379/',
          RESP: 2,
          sample: 'sample',
          socket: {
            keepAlive: true,
            keepAliveInitialDelay: 60000
          }
        }
      ]
    ]);
    connectStub.calledOnce.should.be.true();
  });

  it('should connect to redis with tls', async () => {
    const newConfig = cloneDeep(config);
    newConfig.options.tls.key = 'key';
    await redis(newConfig);
    delete createdOptions().socket.reconnectStrategy;
    createClientStub.args.should.eql([
      [
        {
          url: 'redis://localhost:6379/',
          RESP: 2,
          sample: 'sample',
          socket: {
            keepAlive: true,
            keepAliveInitialDelay: 60000,
            tls: true,
            key: 'key'
          }
        }
      ]
    ]);
  });

  it('should connect to redis without options in config', async () => {
    const newConfig = cloneDeep(config);
    delete newConfig.options;
    await redis(newConfig);
    delete createdOptions().socket.reconnectStrategy;
    createClientStub.args.should.eql([
      [
        {
          url: 'redis://localhost:6379/',
          RESP: 2,
          socket: {
            keepAlive: true,
            keepAliveInitialDelay: 60000
          }
        }
      ]
    ]);
  });

  it('should not connect to redis', async () => {
    await redis({});
    createClientStub.args.should.eql([]);
  });

  describe('reconnectStrategy', () => {
    it('returns server refused error', async () => {
      await redis(config);
      reconnectStrategy()(0, { code: 'ECONNREFUSED' }).should.eql(new Error('The server refused the connection'));
    });

    it('returns server refused error for aggregate errors', async () => {
      await redis(config);
      reconnectStrategy()(0, { errors: [{ code: 'ECONNREFUSED' }] }).should.eql(
        new Error('The server refused the connection')
      );
    });

    it('returns retry time exhausted error', async () => {
      const clock = sandbox.useFakeTimers();
      await redis(config);
      reconnectStrategy()(0, new Error('boom')).should.equal(2000);
      clock.tick(1000 * 60 * 60 + 1);
      reconnectStrategy()(1, new Error('boom')).should.eql(new Error('Retry time exhausted'));
    });

    it('resets the retry time window after a successful reconnection', async () => {
      const clock = sandbox.useFakeTimers();
      await redis(config);
      reconnectStrategy()(0, new Error('boom')).should.equal(2000);
      clock.tick(1000 * 60 * 60 + 1);
      emit('ready');
      reconnectStrategy()(0, new Error('boom')).should.equal(2000);
    });

    it('returns error after 10 times connected - health check will report unhealthy after that', async () => {
      await redis(config);
      for (let i = 0; i < 11; i++) emit('ready');
      reconnectStrategy()(0, new Error('boom')).should.be.an.instanceOf(Error);
    });

    it('returns ms to retry connection', async function() {
      await redis(config);
      reconnectStrategy()(1, new Error('boom')).should.equal(4000);
    });
  });
});
