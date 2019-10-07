import diamorphosis from '../../src/initializers/diamorphosis';
import { OrkaOptions } from '../../src/typings/orka';
import * as path from 'path';

describe('Diamorphosis Test', () => {
  describe('should set config variables', () => {
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
});
