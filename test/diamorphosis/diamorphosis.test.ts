import { describe, it, beforeEach, afterEach, before, after } from 'node:test';
import assert from 'node:assert';
import diamorphosis from '../../src/initializers/diamorphosis';
import { OrkaOptions } from '../../src/typings/orka';
import * as path from 'path';

describe('Diamorphosis Test', () => {
  describe('should set environment variables', () => {
    let options: OrkaOptions;

    beforeEach(() => {
      options = {
        diamorphosis: {
          configFolder: './test/diamorphosis',
          configPath: path.resolve('./test/diamorphosis/config'),
          envFolder: path.resolve('./test/diamorphosis/env')
        }
      } as OrkaOptions;
    });

    afterEach(() => {
      delete require.cache[require.resolve(options.diamorphosis.configPath)];
    });

    it('app.env and nodeEnv shoud equal development with empty config', () => {
      let config = {} as any;

      diamorphosis(config, {} as OrkaOptions);

      assert.strictEqual(config.app.env, config.nodeEnv);
      assert.strictEqual(config.app.env, 'development');
    });

    it('app.env and nodeEnv shoud equal nodeEnv with nodeEnv set in config', () => {
      const config = require(options.diamorphosis.configPath);

      diamorphosis(config, {} as OrkaOptions);

      assert.strictEqual(config.app.env, config.nodeEnv);
      assert.strictEqual(config.app.env, 'diamorphosis_env');
      assert.strictEqual(config.visitor.cookie, 'cookie');
      assert.strictEqual(config.healthCheck.kafka, true);
    });

    it('app.env and nodeEnv shoud equal nodeEnv with nodeEnv set in env file', () => {
      const config = require(options.diamorphosis.configPath);

      diamorphosis(config, options);

      assert.strictEqual(config.app.env, config.nodeEnv);
      assert.strictEqual(config.app.env, 'test');
    });

    it('app.env and nodeEnv shoud equal process.env.NODE_ENV with nodeEnv set in process.env', () => {
      process.env.NODE_ENV = 'testProcess';

      const config = require(options.diamorphosis.configPath);

      diamorphosis(config, options);

      assert.strictEqual(config.app.env, config.nodeEnv);
      assert.strictEqual(config.nodeEnv, process.env.NODE_ENV);
      assert.strictEqual(config.app.env, process.env.NODE_ENV);
    });

    describe('for kafka', function () {
      afterEach(() => {
        delete process.env.KAFKA_PRODUCER_BROKERS;
        delete process.env.KAFKA_PRODUCER_SASL_USERNAME;
        delete process.env.KAFKA_PRODUCER_SASL_PASSWORD;
      });

      it('noop if kafka not exist in config', () => {
        process.env.KAFKA_PRODUCER_BROKERS = 'confluent1,confluent2';

        const config = require(options.diamorphosis.configPath);
        delete config.kafka;
        diamorphosis(config, options);
        assert.deepStrictEqual(config.kafka, {
          brokers: [],
          groupId: '',
          clientId: '',
          ssl: true,
          log: {
            errorToWarn: ['The group is rebalancing, re-joining', 'Response Heartbeat(key: 12, version: 3)']
          },
          certificates: { key: '', cert: '', ca: [], rejectUnauthorized: false },
          sasl: { mechanism: '', username: '', password: '' },
          producer: {
            brokers: ['confluent1', 'confluent2'],
            ssl: true,
            certificates: { key: '', cert: '', ca: [], rejectUnauthorized: false },
            sasl: { mechanism: '', username: '', password: '' }
          },
          connectionTimeout: 5000,
          authenticationTimeout: 10000
        });
      });

      it('kafka.producer options should set if exist in process.env', () => {
        process.env.KAFKA_PRODUCER_BROKERS = 'confluent1,confluent2';
        process.env.KAFKA_PRODUCER_SASL_USERNAME = 'producer username';
        process.env.KAFKA_PRODUCER_SASL_PASSWORD = 'producer password';

        const config = require(options.diamorphosis.configPath);

        diamorphosis(config, options);

        assert.deepStrictEqual(config.kafka.producer, {
          brokers: ['confluent1', 'confluent2'],
          certificates: {
            ca: [],
            cert: '',
            key: '',
            rejectUnauthorized: false
          },
          sasl: {
            mechanism: '',
            username: 'producer username',
            password: 'producer password'
          },
          ssl: true,
          topics: {
            topic1: 'topic1'
          }
        });
      });
    });
  });

  describe('should set json/console loggingvariables', () => {
    let options: OrkaOptions;

    beforeEach(() => {
      options = {
        diamorphosis: {
          configFolder: './test/diamorphosis',
          configPath: path.resolve('./test/diamorphosis/config'),
          envFolder: path.resolve('./test/diamorphosis/env')
        }
      } as OrkaOptions;
    });

    afterEach(() => {
      delete require.cache[require.resolve(options.diamorphosis.configPath)];
    });

    describe('when nothing is set config', () =>
      it('should be console:true, json:false, styles:[]', () => {
        let config = {} as any;

        diamorphosis(config, {} as OrkaOptions);

        assert.strictEqual(config.log.console, true);
        assert.strictEqual(config.log.json, false);
        assert.strictEqual(config.riviere.styles.length, 0);
      })
    );

    describe('when console:not set, json:true, styles:[]', () =>
      it('shoud be console:false, json:true, styles:["json"]', () => {
        let config = {
          log: {
            json: true
          }
        } as any;

        diamorphosis(config, {} as OrkaOptions);

        assert.strictEqual(config.log.console, false);
        assert.strictEqual(config.log.json, true);
        assert.strictEqual(config.riviere.styles.length, 1);
        assert.strictEqual(config.riviere.styles[0], 'json');
      })
    );

    describe('when console:true, json:true, styles:[]', () =>
      it('shoud be console:true, json:true, styles:["json"]', () => {
        let config = {
          log: {
            console: true,
            json: true
          }
        } as any;

        diamorphosis(config, {} as OrkaOptions);

        assert.strictEqual(config.log.console, true);
        assert.strictEqual(config.log.json, true);
        assert.strictEqual(config.riviere.styles.length, 1);
        assert.strictEqual(config.riviere.styles[0], 'json');
      })
    );

    describe('when console:false, json:true, styles:[]', () =>
      it('shoud be console:false, json:true, styles:["json"]', () => {
        let config = {
          log: {
            console: false,
            json: true
          }
        } as any;

        diamorphosis(config, {} as OrkaOptions);

        assert.strictEqual(config.log.console, false);
        assert.strictEqual(config.log.json, true);
        assert.strictEqual(config.riviere.styles.length, 1);
        assert.strictEqual(config.riviere.styles[0], 'json');
      })
    );

    describe('when console:not set, json:true, styles:["simple"]', () =>
      it('shoud be console:false, json:true, styles:["simple"]', () => {
        let config = {
          log: {
            json: true
          },
          riviere: {
            styles: ['simple']
          }
        } as any;

        diamorphosis(config, {} as OrkaOptions);

        assert.strictEqual(config.log.console, false);
        assert.strictEqual(config.log.json, true);
        assert.strictEqual(config.riviere.styles.length, 1);
        assert.strictEqual(config.riviere.styles[0], 'simple');
      })
    );

    describe('when console:true set in process.env', () => {
      before(() => {
        process.env.LOG_CONSOLE = 'true';
      });

      after(() => {
        delete process.env.LOG_CONSOLE;
      });

      it('shoud be console:true, json:false, styles:[]', () => {
        const config = require(options.diamorphosis.configPath);

        diamorphosis(config, options);

        assert.strictEqual(config.log.console, true);
        assert.strictEqual(config.log.json, false);
        assert.strictEqual(config.riviere.styles.length, 0);
      });
    });

    describe('when console:true, json:true set in process.env', () => {
      before(() => {
        process.env.LOG_CONSOLE = 'true';
        process.env.LOG_JSON = 'true';
      });

      after(() => {
        delete process.env.LOG_CONSOLE;
      });

      it('shoud be console:true, json:false, styles:[]', () => {
        const config = require(options.diamorphosis.configPath);

        diamorphosis(config, options);

        assert.strictEqual(config.log.console, true);
        assert.strictEqual(config.log.json, true);
        assert.deepStrictEqual(config.riviere.styles, ['json']);
      });
    });
  });
});
