import diamorphosis from '../../src/initializers/diamorphosis';
import { OrkaOptions } from '../../src/typings/orka';
import * as path from 'path';
import * as assert from 'assert';

describe('Diamorphosis Test', () => {
  describe('should set environment variables', () => {
    let options;

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

      config.app.env.should.equal(config.nodeEnv);
      config.app.env.should.equal('development');
    });

    it('app.env and nodeEnv shoud equal nodeEnv with nodeEnv set in config', () => {
      const config = require(options.diamorphosis.configPath);

      diamorphosis(config, {} as OrkaOptions);

      config.app.env.should.equal(config.nodeEnv);
      config.app.env.should.equal('diamorphosis_env');
    });

    it('app.env and nodeEnv shoud equal nodeEnv with nodeEnv set in env file', () => {
      const config = require(options.diamorphosis.configPath);

      diamorphosis(config, options);

      config.app.env.should.equal(config.nodeEnv);
      config.app.env.should.equal('test');
    });

    it('app.env and nodeEnv shoud equal process.env.NODE_ENV with nodeEnv set in process.env', () => {
      process.env.NODE_ENV = 'testProcess';

      const config = require(options.diamorphosis.configPath);

      diamorphosis(config, options);

      config.app.env.should.equal(config.nodeEnv);
      config.nodeEnv.should.equal(process.env.NODE_ENV);
      config.app.env.should.equal(process.env.NODE_ENV);
    });

    it('noop if kafka not exist in config', () => {
      process.env.KAFKA_PRODUCER_BROKERS = 'confluent1,confluent2';

      const config = require(options.diamorphosis.configPath);
      delete config.kafka;
      diamorphosis(config, options);

      assert(config.kafka === undefined);
    });

    it('kafka.producer options should set if exist in process.env', () => {
      process.env.KAFKA_PRODUCER_BROKERS = 'confluent1,confluent2';
      process.env.KAFKA_PRODUCER_SASL_USERNAME = 'producer username';
      process.env.KAFKA_PRODUCER_SASL_PASSWORD = 'producer password';

      const config = require(options.diamorphosis.configPath);

      diamorphosis(config, options);

      config.kafka.producer.should.eql({
        brokers: ['confluent1', 'confluent2'],
        certificates: {
          ca: '',
          cert: '',
          key: ''
        },
        sasl: {
          username: 'producer username',
          password: 'producer password'
        },
        topics: {
          topic1: 'topic1'
        }
      });
    });
  });

  describe('should set json/console loggingvariables', () => {
    let options;

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

    context('when nothing is set config', () =>
      it('should be console:true, json:false, styles:[]', () => {
        let config = {} as any;

        diamorphosis(config, {} as OrkaOptions);

        config.log.console.should.equal(true);
        config.log.json.should.equal(false);
        config.riviere.styles.length.should.equal(0);
      })
    );

    context('when console:not set, json:true, styles:[]', () =>
      it('shoud be console:false, json:true, styles:["json"]', () => {
        let config = {
          log: {
            json: true
          }
        } as any;

        diamorphosis(config, {} as OrkaOptions);

        config.log.console.should.equal(false);
        config.log.json.should.equal(true);
        config.riviere.styles.length.should.equal(1);
        config.riviere.styles[0].should.equal('json');
      })
    );

    context('when console:true, json:true, styles:[]', () =>
      it('shoud be console:true, json:true, styles:["json"]', () => {
        let config = {
          log: {
            console: true,
            json: true
          }
        } as any;

        diamorphosis(config, {} as OrkaOptions);

        config.log.console.should.equal(true);
        config.log.json.should.equal(true);
        config.riviere.styles.length.should.equal(1);
        config.riviere.styles[0].should.equal('json');
      })
    );

    context('when console:false, json:true, styles:[]', () =>
      it('shoud be console:false, json:true, styles:["json"]', () => {
        let config = {
          log: {
            console: false,
            json: true
          }
        } as any;

        diamorphosis(config, {} as OrkaOptions);

        config.log.console.should.equal(false);
        config.log.json.should.equal(true);
        config.riviere.styles.length.should.equal(1);
        config.riviere.styles[0].should.equal('json');
      })
    );

    context('when console:not set, json:true, styles:["simple"]', () =>
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

        config.log.console.should.equal(false);
        config.log.json.should.equal(true);
        config.riviere.styles.length.should.equal(1);
        config.riviere.styles[0].should.equal('simple');
      })
    );

    context('when console:true set in process.env', () => {
      before(() => {
        process.env.LOG_CONSOLE = 'true';
      });

      after(() => {
        delete process.env.LOG_CONSOLE;
      });

      it('shoud be console:true, json:false, styles:[]', () => {
        const config = require(options.diamorphosis.configPath);

        diamorphosis(config, options);

        config.log.console.should.equal(true);
        config.log.json.should.equal(false);
        config.riviere.styles.length.should.equal(0);
      });
    });

    context('when console:true, json:true set in process.env', () => {
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

        config.log.console.should.equal(true);
        config.log.json.should.equal(true);
        config.riviere.styles.should.eql(['json']);
      });
    });
  });
});
