import * as path from 'path';
import diamorphosis from './initializers/diamorphosis';
import honeybadger from './initializers/honeybadger';
import newrelic from './initializers/newrelic';
import { default as log4js, getLogger } from './initializers/log4js';
import defaultConfig from './default-options';
import { OrkaOptions } from 'typings/orka';
import koa from './initializers/koa';

export default class Orka {
  public rootPath = path.resolve('.');
  public options = defaultConfig;

  constructor(options = {} as Partial<OrkaOptions>) {
    options.routesPath = options.routesPath && path.resolve(options.routesPath);
    this.extendOptions(options);
  }

  extendOptions(options) {
    Object.assign(this.options, {
      ...options,
      diamorphosis: Object.assign(this.options.diamorphosis, options.diamorphosis)
    });
  }

  async start() {
    try {
      if (this.options.typescript) {
        await import('source-map-support/register');
        await import('tsconfig-paths/register');
      }
      const config = await import(`${this.options.diamorphosis.configPath}`); // the application config
      await diamorphosis(config, this.options);
      if (config.orka) {
        // extend orka config from application config if it exists
        this.extendOptions(config.orka);
      }

      await honeybadger(config, this.options);
      await log4js(config, this.options);
      await newrelic(config, this.options);
      await koa(config, this.options);
    } catch (e) {
      getLogger('orka').error(e);
      process.exit(1);
    }
  }
}
