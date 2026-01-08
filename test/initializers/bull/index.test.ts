import { merge } from 'lodash';
import init from '../../../src/initializers/bull/index';
import { getBull } from '../../../src/initializers/bull/index';
import * as should from 'should';

describe('bull init', () => {
  const appName = 'test';
  const orkaRedisConfig = {
    redis: {
      url: 'redis://orka:6379/',
      options: {
        tls: {
          ca: ['orka-ca'],
          cert: 'orka-cert',
          key: 'orka-key'
        }
      }
    }
  };
  const bullRedisConfig = {
    bull: {
      redis: {
        url: 'redis://bull:6379/',
        tls: {
          ca: ['bull-ca'],
          cert: 'bull-cert',
          key: 'bull-key'
        }
      }
    }
  };
  const bullRedisReuseConnectionsConfig = {
    bull: {
      reuseConnections: true,
      redis: {
        url: 'redis://bull:6379/',
        tls: {
          ca: ['bull-ca'],
          cert: 'bull-cert',
          key: 'bull-key'
        }
      }
    }
  };
  const baseConfig = {
    bull: {
      queue: {
        queues: [
          {
            name: 'test'
          }
        ]
      }
    }
  };
  const queueConfig = {
    bull: {
      queue: {
        options: {
          removeOnComplete: true
        },
        queues: [
          {
            name: 'queue_one',
            options: { priority: 1 }
          },
          {
            name: 'queue_two',
            options: { delay: 15000 }
          }
        ]
      }
    }
  };
  const moreRedisOpts = {
    bull: {
      redis: {
        enableReadyCheck: true
      }
    }
  };
  it('should handle the absence of bull config', async () => {
    await init({} as any, appName);
    should.throws(() => {
      getBull();
    }, 'bull is not initialized');
  });

  describe('when using common redis options', () => {
    it('should initialize bull with orka redis options', async () => {
      const config = merge({}, baseConfig, orkaRedisConfig);
      await init(config as any, appName);
      const bull = getBull();
      const expectedRedisOpts = {
        host: 'orka',
        port: '6379',
        tls: { ca: ['orka-ca'], cert: 'orka-cert', key: 'orka-key' },
        enableReadyCheck: false
      };
      bull['redisOpts'].should.be.eql(expectedRedisOpts);
    });
  });
  describe('when using bull specific redis options', () => {
    it('should initialize bull with specific redis options', async () => {
      const config = merge({}, baseConfig, orkaRedisConfig, bullRedisConfig);
      await init(config as any, appName);
      const bull = getBull();
      const expectedRedisOpts = {
        host: 'bull',
        port: '6379',
        tls: { ca: ['bull-ca'], cert: 'bull-cert', key: 'bull-key' },
        enableReadyCheck: false
      };
      bull['redisOpts'].should.be.eql(expectedRedisOpts);
    });
    it('should allow passing more redis options', async () => {
      const config = merge({}, baseConfig, orkaRedisConfig, bullRedisConfig, moreRedisOpts);
      await init(config as any, appName);
      const bull = getBull();
      const expectedRedisOpts = {
        host: 'bull',
        port: '6379',
        tls: { ca: ['bull-ca'], cert: 'bull-cert', key: 'bull-key' },
        enableReadyCheck: true
      };
      bull['redisOpts'].should.be.eql(expectedRedisOpts);
    });
  });
  it('should initialize bull with queue options from configuration', async () => {
    const config = merge({}, baseConfig, bullRedisConfig, queueConfig);
    await init(config as any, appName);
    const bull = getBull();
    bull['prefix'].should.be.eql(appName);
    bull['defaultOptions'].should.be.eql(queueConfig.bull.queue.options);
    const expectedQueues = {
      queue_one: { name: 'queue_one', options: { priority: 1 } },
      queue_two: { name: 'queue_two', options: { delay: 15000 } }
    };
    bull['queueOpts'].should.be.eql(expectedQueues);
  });
  it('should initialize bull with reuseConnections options from configuration', async () => {
    const config = merge({}, baseConfig, bullRedisReuseConnectionsConfig, queueConfig);
    await init(config as any, appName);
    const bull = getBull();
    bull['reuseClients'].should.be.true();
  });
});
