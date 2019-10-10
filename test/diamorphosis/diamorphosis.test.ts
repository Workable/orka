import diamorphosis from '../../src/initializers/diamorphosis';
import { OrkaOptions } from '../../src/typings/orka';
import * as path from 'path';

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

    it('honeybadger.enviroment and nodeEnv shoud equal development with empty config', () => {
      let config = {} as any;

      diamorphosis(config, {} as OrkaOptions);

      config.honeybadger.environment.should.equal(config.nodeEnv);
      config.honeybadger.environment.should.equal('development');
    });

    it('honeybadger.enviroment and nodeEnv shoud equal nodeEnv with nodeEnv set in config', () => {
      const config = require(options.diamorphosis.configPath);

      diamorphosis(config, {} as OrkaOptions);

      config.honeybadger.environment.should.equal(config.nodeEnv);
      config.honeybadger.environment.should.equal('diamorphosis_env');
    });

    it('honeybadger.enviroment and nodeEnv shoud equal nodeEnv with nodeEnv set in env file', () => {
      const config = require(options.diamorphosis.configPath);

      diamorphosis(config, options);

      config.honeybadger.environment.should.equal(config.nodeEnv);
      config.honeybadger.environment.should.equal('test');
    });

    it('honeybadger.enviroment and nodeEnv shoud equal process.env.NODE_ENV with nodeEnv set in process.env', () => {
      process.env.NODE_ENV = 'testProcess';

      const config = require(options.diamorphosis.configPath);

      diamorphosis(config, options);

      config.honeybadger.environment.should.equal(config.nodeEnv);
      config.nodeEnv.should.equal(process.env.NODE_ENV);
      config.honeybadger.environment.should.equal(process.env.NODE_ENV);
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

    context('when console:false set in process.env', () =>
      it('shoud be console:false, json:true, styles:["simple"]', () => {
        process.env.LOG_CONSOLE = 'false';

        const config = require(options.diamorphosis.configPath);

        diamorphosis(config, options);

        config.log.console.should.equal(false);
        config.log.json.should.equal(false);
        config.riviere.styles.length.should.equal(0);
      })
    );
  });
});
