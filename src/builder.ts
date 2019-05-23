import * as path from 'path';
import * as lodash from 'lodash';
import { router } from 'fast-koa-router';
import { Middleware } from 'koa-compose';
import * as compress from 'koa-compress';
import * as cors from 'koa2-cors';
import * as bodyParser from 'koa-bodyparser';
import diamorphosis from './initializers/diamorphosis';
import honeybadger from './initializers/honeybadger';
import newrelic from './initializers/newrelic';
import { default as log4js, getLogger } from './initializers/log4js';
import riviere from './initializers/koa/riviere';
import addRequestId from './initializers/koa/add-request-id';
import _defaults from './default-options';
import { OrkaOptions } from './typings/orka';
import assert = require('assert');
import { Server } from 'http';
import logo from './initializers/logo';

const builder = (defaults: Partial<OrkaOptions> = _defaults) => {
  const options: Partial<OrkaOptions> = lodash.cloneDeep(defaults);
  const queue: (() => Promise<void> | void)[] = [];

  // Always initialize diamorphosis.
  if (!options.diamorphosis.configPath) {
    options.diamorphosis.configPath = path.resolve(options.diamorphosis.configFolder + '/config.js');
  }
  if (!options.diamorphosis.envFolder) {
    options.diamorphosis.envFolder = path.resolve(options.diamorphosis.configFolder + '/env');
  }
  const config = require(`${options.diamorphosis.configPath}`);
  diamorphosis(config, options);

  // always use logger
  log4js(config);
  let server: Server;
  // errorHandler needs to be called after log4js initialization for logger to work as expected.
  const errorHander = require('./initializers/koa/error-handler').default;

  const middlewares: Middleware<any>[] = [];

  const _ = {
    use: (m: Middleware<any> | Middleware<any>[] = []) => {
      if (Array.isArray(m)) {
        m.forEach(__ => middlewares.push(__));
      } else {
        middlewares.push(m);
      }
      return _;
    },
    useDefaults: () => {
      _.use(riviere(config));
      _.use(compress());
      _.useCors();
      _.use(addRequestId(config));
      _.use(errorHander(config));
      _.use(bodyParser());
      return _;
    },
    useCors: (allowedOrigins = config.allowedOrigins) => {
      const allowedOrigin = new RegExp('https?://(www\\.)?([^.]+\\.)?(' + allowedOrigins.join(')|(') + ')');
      return _.use(
        cors({
          origin: ctx =>
            allowedOrigin.test(ctx.request.headers.origin) ? ctx.request.headers.origin : allowedOrigins[0]
        })
      );
    },
    forTypescript: () => {
      queue.unshift(() => import('tsconfig-paths/register'));
      queue.unshift(() => import('source-map-support/register'));
      return _;
    },
    withNewrelic: (appName: string = options.appName) => {
      queue.push(() => newrelic(config, { appName }));
      return _;
    },
    withHoneyBadger: (o: any = options.honeyBadger) => {
      queue.push(() => honeybadger(config, o));
      return _;
    },
    with: tasks => {
      tasks = lodash.flatten([tasks]).filter(lodash.identity);
      tasks.forEach(task => queue.push(() => task(config)));
      return _;
    },
    withLogo: (pathToLogo: string) => {
      queue.push(() => logo(config, pathToLogo));
      return _;
    },
    routes: (m: string) => {
      let routes = require(path.resolve(m));
      if (routes.default && Object.keys(routes).length === 1) {
        routes = routes.default;
      }
      return _.use(router(routes));
    },
    start: async (port: number = config.port) => {
      const _logger = getLogger('orka');
      try {
        _logger.info(`Initializing orka processing ${queue.length} tasks and ${middlewares.length} middlewares…`);
        while (queue.length) {
          await queue.shift()();
        }
        const koa = await import('./initializers/koa');
        server = await koa.default(port, middlewares, (logger = _logger) => {
          logger.info(`Server listening to http://localhost:${port}/`);
          logger.info(`Server environment: ${config.nodeEnv}`);
        });
      } catch (e) {
        _logger.error(e);
        process.exit(1);
      }
    },
    stop: async () => {
      const _logger = getLogger('orka');
      assert(server, 'Application is not started');
      _logger.info('Shutting down server');
      server.close();
    }
  };
  return _;
};

export default builder;
