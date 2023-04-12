import newrelic from './initializers/newrelic';
import { OrkaOptions } from './typings/orka';
import _defaults from './default-options';
import * as lodash from 'lodash';
import { getLogger } from './initializers/log4js';
import orkaType from './orka-builder';
import { AsyncLocalStorage } from 'async_hooks';
import { alsSupported } from './utils';
import datadog from './initializers/datadog';
import riviere from './initializers/riviere';

let als: AsyncLocalStorage<Map<string, any>> | undefined;
if (alsSupported()) {
  als = new AsyncLocalStorage<Map<string, any>>();
}

export const getRequestContext = () => als?.getStore();

export const runWithContext = (store: Map<string, any>, callback: (args: any[]) => void, ...args: any[]) => {
  if (!als) {
    throw new Error('AsyncLocalStorage is not supported');
  }
  return als.run(store, callback, args);
};

export default (defaults: Partial<OrkaOptions> = _defaults) => {
  const options: Partial<OrkaOptions> = lodash.cloneDeep(lodash.defaultsDeep({}, defaults, _defaults));

  const diamorphosis = require('./initializers/diamorphosis').default;
  const path = require('path');

  const logger = getLogger('orka');
  // Always initialize diamorphosis
  if (!options.diamorphosis.configPath) {
    options.diamorphosis.configPath = path.resolve(options.diamorphosis.configFolder + '/config');
  }
  if (!options.diamorphosis.envFolder) {
    options.diamorphosis.envFolder = path.resolve(options.diamorphosis.configFolder + '/env');
  }
  const cached = require.cache[require.resolve(options.diamorphosis.configPath)];
  if (cached) {
    logger.error(
      new Error(
        `Config in path ${options.diamorphosis.configPath} was already required. ` +
          `Your config might be used before being initialized by orka (diamorphosis).`
      )
    );
  }
  let config = require(options.diamorphosis.configPath);
  // module.exports vs export default
  config = config.default && Object.keys(config).length === 1 ? config.default : config;
  diamorphosis(config, options);

  options.appName ||= config?.app?.name;
  const checkModulesAreNotInitialized = (...modules: string[]) => {
    modules.forEach(m => {
      try {
        if (require.cache[require.resolve(m)]) logger.warn(`${m} was initialized before orka`);
      } catch (e) {
        // module not found at all
      }
    });
  };
  checkModulesAreNotInitialized('koa', 'mongoose', 'amqplib', 'pg', 'mongodb');

  // Always call newrelic
  newrelic(config, options.appName);
  datadog(config);

  const log4js = require('./initializers/log4js').default;
  // Always use logger
  log4js(config);

  // initialize riviere
  riviere(config, options);

  // errorHandler needs to be called after log4js initialization for logger to work as expected.
  const errorHandler = require('./initializers/koa/error-handler').default;

  const OrkaBuilder: typeof orkaType = require('./orka-builder').default;
  return new OrkaBuilder(options, config, errorHandler, als);
};
