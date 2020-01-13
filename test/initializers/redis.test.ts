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
  let connectStub: sinon.SinonSpy;
  let onStub: sinon.SinonSpy;

  beforeEach(async function() {
    onStub = sandbox.stub();
    connectStub = sandbox.stub().returns({ on: onStub });
    delete require.cache[require.resolve('../../src/initializers/redis')];
    mock('redis', { createClient: connectStub });
    ({ createRedisConnection: redis } = await import('../../src/initializers/redis'));
  });

  afterEach(function() {
    sandbox.restore();
    mock.stopAll();
  });

  it('should connect to redis', () => {
    redis(config);
    delete connectStub.args[0][1].retry_strategy;
    connectStub.args.should.eql([
      [
        'redis://localhost:6379/',
        {
          timesConnected: 10,
          totalRetryTime: 3600000,
          reconnectAfterMultiplier: 1000,
          socketKeepalive: true,
          socketInitialDelay: 60000,
          sample: 'sample'
        }
      ]
    ]);
  });

  it('should connect to redis with tls', () => {
    const newConfig = cloneDeep(config);
    newConfig.options.tls.key = 'key';
    redis(newConfig);
    delete connectStub.args[0][1].retry_strategy;
    connectStub.args.should.eql([
      [
        'redis://localhost:6379/',
        {
          timesConnected: 10,
          totalRetryTime: 3600000,
          reconnectAfterMultiplier: 1000,
          socketKeepalive: true,
          socketInitialDelay: 60000,
          sample: 'sample',
          tls: {
            key: 'key'
          }
        }
      ]
    ]);
  });

  it('should connect to redis without options in config', () => {
    const newConfig = cloneDeep(config);
    delete newConfig.options;
    redis(newConfig);
    delete connectStub.args[0][1].retry_strategy;
    connectStub.args.should.eql([
      [
        'redis://localhost:6379/',
        {
          timesConnected: 10,
          totalRetryTime: 3600000,
          reconnectAfterMultiplier: 1000,
          socketKeepalive: true,
          socketInitialDelay: 60000
        }
      ]
    ]);
  });

  it('should not connect to redis', () => {
    redis({});
    connectStub.args.should.eql([]);
  });

  describe('retry_strategy', () => {
    it('returns server refused error', () => {
      redis(config);
      connectStub.args[0][1]
        .retry_strategy({ error: { code: 'ECONNREFUSED' } })
        .should.eql(new Error('The server refused the connection'));
    });

    it('returns retry time exhausted error', () => {
      redis(config);
      connectStub.args[0][1]
        .retry_strategy({ total_retry_time: 1000 * 60 * 60 + 1 })
        .should.eql(new Error('Retry time exhausted'));
    });

    it('throws error after 10 times connected - server will restart after that', () => {
      redis(config);
      (() => connectStub.args[0][1].retry_strategy({ times_connected: 11 })).should.throwError();
    });

    it('returns ms to retry connection', function() {
      redis(config);
      connectStub.args[0][1].retry_strategy({ attempt: 2 }).should.equal(4000);
    });
  });
});
