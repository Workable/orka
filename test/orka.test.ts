import { strict as assert } from 'assert';
import Orka from '../build/orka';

describe('Orka', function() {
  describe('orkaConfig', function() {
    it('supports default config', function() {
      assert.deepEqual(new Orka().config, {
        afterMiddleware: [],
        appName: '',
        beforeMiddleware: [],
        diamorphosis: {
          configFolder: '/Users/nikoskostoulas/dev/orka/config',
          configPath: '/Users/nikoskostoulas/dev/orka/config/config.js',
          envFolder: '/Users/nikoskostoulas/dev/orka/config/env',
          loadDotEnv: ['development']
        },
        honeyBadger: {
          developmentEnvironments: ['development', 'test']
        },
        routesPath: undefined,
        typescript: false
      });
    });

    it('partially updates diamorphosis config', function() {
      assert.deepEqual(
        new Orka({
          diamorphosis: {
            configFolder: './foo',
            loadDotEnv: ['production']
          } as any
        }).config,
        {
          afterMiddleware: [],
          appName: '',
          beforeMiddleware: [],
          diamorphosis: {
            configFolder: './foo',
            configPath: '/Users/nikoskostoulas/dev/orka/foo/config.js',
            envFolder: '/Users/nikoskostoulas/dev/orka/foo/env',
            loadDotEnv: ['production']
          },
          honeyBadger: {
            developmentEnvironments: ['development', 'test']
          },
          routesPath: undefined,
          typescript: false
        }
      );
    });

    it('updates config', function() {
      assert.deepEqual(
        new Orka({
          appName: 'name'
        }).config,
        {
          afterMiddleware: [],
          appName: 'name',
          beforeMiddleware: [],
          diamorphosis: {
            configFolder: './foo',
            configPath: '/Users/nikoskostoulas/dev/orka/foo/config.js',
            envFolder: '/Users/nikoskostoulas/dev/orka/foo/env',
            loadDotEnv: ['production']
          },
          honeyBadger: {
            developmentEnvironments: ['development', 'test']
          },
          routesPath: undefined,
          typescript: false
        }
      );
    });
  });

  describe('start', function() {
    it('updates config from config.orka');
    it('initializes typescript');

    it('initializes diamorphosis');
    it('initializes honeybadger');

    it('initializes log4js');
    it('initializes newrelic');
    it('initializes koa');
  });
});
