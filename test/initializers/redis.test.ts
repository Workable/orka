const mock = require('mock-require');
import * as sinon from 'sinon';
import 'should';

const sandbox = sinon.createSandbox();

describe('Redis connection', function() {
  const config = {
    redis: {
      url: 'redis://localhost:6379/',
      options: {
        sample: 'sample'
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
    connectStub.args.should.containDeep([
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

  it('should not connect to redis', () => {
    redis({});
    connectStub.args.should.eql([]);
  });
});
