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

export class OrkaBuilder {
  options: Partial<OrkaOptions>;
  config: any;
  middlewares: Middleware<any>[];
  errorHandler: any;
  queue: (() => Promise<void> | void)[];
  server: Server;

  constructor(options, config, errorHandler) {
    this.options = options;
    this.config = config;
    this.middlewares = [];
    this.errorHandler = errorHandler;
    this.queue = [];
  }

  use(m: Middleware<any> | Middleware<any>[] = []) {
    if (Array.isArray(m)) {
      m.forEach(__ => this.middlewares.push(__));
    } else {
      this.middlewares.push(m);
    }
    return this;
  }

  useDefaults() {
    this.use(riviere(this.config));
    this.use(compress());
    this.useCors();
    this.use(addRequestId(this.config));
    this.use(this.errorHandler(this.config));
    this.use(bodyParser());
    return this;
  }

  useCors(allowedOrigins = this.config.allowedOrigins) {
    const allowedOrigin = new RegExp('https?://(www\\.)?([^.]+\\.)?(' + allowedOrigins.join(')|(') + ')');
    return this.use(
      cors({
        origin: ctx =>
          allowedOrigin.test(ctx.request.headers.origin) ? ctx.request.headers.origin : allowedOrigins[0]
      })
    );
  }

  forTypescript() {
    require('tsconfig-paths/register');
    require('source-map-support/register');
    return this;
  }

  withNewrelic(appName: string = this.options.appName) {
    this.queue.push(() => newrelic(this.config, { appName }));
    return this;
  }

  withHoneyBadger(o: any = this.options.honeyBadger) {
    this.queue.push(() => honeybadger(this.config, o));
    return this;
  }

  with(tasks) {
    tasks = lodash.flatten([tasks]).filter(lodash.identity);
    tasks.forEach(task => this.queue.push(() => task(this.config)));
    return this;
  }

  withLogo(pathToLogo: string) {
    this.queue.push(() => logo(this.config, pathToLogo));
    return this;
  }

  routes(m: string) {
    let routes = require(path.resolve(m));
    if (routes.default && Object.keys(routes).length === 1) {
      routes = routes.default;
    }
    return this.use(router(routes));
  }

  async start(port: number = this.config.port) {
    const _logger = getLogger('orka');
    try {
      _logger.info(`Initializing orka processing ${this.queue.length} tasks and ${this.middlewares.length} middlewares…`);
      while (this.queue.length) {
        await this.queue.shift()();
      }
      const koa = await import('./initializers/koa');
      this.server = await koa.default(port, this.middlewares, (logger = _logger) => {
        logger.info(`Server listening to http://localhost:${port}/`);
        logger.info(`Server environment: ${this.config.nodeEnv}`);
      });
    } catch (e) {
      _logger.error(e);
      process.exit(1);
    }
  }

  async stop() {
    const _logger = getLogger('orka');
    assert(this.server, 'Application is not started');
    _logger.info('Shutting down server');
    this.server.close();
  }
}

const builder = (defaults: Partial<OrkaOptions> = _defaults) => {
  const options: Partial<OrkaOptions> = lodash.cloneDeep(defaults);

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

  // errorHandler needs to be called after log4js initialization for logger to work as expected.
  const errorHandler = require('./initializers/koa/error-handler').default;

  return new OrkaBuilder(options, config, errorHandler);
};

export default builder;
