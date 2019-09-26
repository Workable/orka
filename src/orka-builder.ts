import * as path from 'path';
import * as lodash from 'lodash';
import { router } from 'fast-koa-router';
import { Middleware, Context } from 'koa';
import * as compress from 'koa-compress';
import * as cors from 'koa2-cors';
import * as bodyParser from 'koa-bodyparser';
import honeybadger from './initializers/honeybadger';
import rabbitmq from './initializers/rabbitmq';
import mongodb from './initializers/mongodb';
import { getLogger } from './initializers/log4js';
import riviere from './initializers/koa/riviere';
import addRequestId from './initializers/koa/add-request-id';
import _defaults from './default-options';
import { OrkaOptions } from './typings/orka';
import assert = require('assert');
import { Server } from 'http';
import logo from './initializers/logo';
import kafka from './initializers/kafka';
import * as Koa from 'koa';

export default class OrkaBuilder {
  options: Partial<OrkaOptions>;
  config: any;
  middlewares: Middleware<any>[];
  koaTasks: ((app: Koa<any, {}>, config: any) => Middleware<any> | Middleware<any>[])[];
  errorHandler: any;
  queue: (() => Promise<void> | void)[];
  server: Server;

  constructor(options, config, errorHandler) {
    this.options = options;
    this.config = config;
    this.middlewares = [];
    this.koaTasks = [];
    this.errorHandler = errorHandler;
    this.queue = [];
  }

  use(task: (app: Koa<any, {}>, config: any) => Middleware<any> | Middleware<any>[] = () => []) {
    this.koaTasks.push(task);
    return this;
  }

  useDefaults() {
    this.use(() => bodyParser());
    this.use(() => riviere(this.config, this.options));
    //this.use(() => this.errorHandler(this.config, this.options));
    this.use(
      () =>
        async function koaCompress(...args) {
          await compress()(...args);
        }
    );
    this.useCors();
    this.use(() => addRequestId(this.config));
    return this;
  }

  useCors({ credentials = undefined, allowedOrigins = this.config.allowedOrigins } = this.config.cors || {}) {
    const allowedOrigin = new RegExp('https?://(www\\.)?([^.]+\\.)?(' + allowedOrigins.join(')|(') + ')');

    return this.use(() =>
      cors({
        origin: (ctx: Context) => {
          const origin = ctx.request.headers.origin || ctx.request.origin;
          return allowedOrigin.test(origin) ? origin : allowedOrigins[0];
        },
        credentials
      })
    );
  }

  forTypescript(isTypeScript = true) {
    if (!isTypeScript) {
      return this;
    }
    require('tsconfig-paths/register');
    require('source-map-support/register');
    return this;
  }

  withRabbitMQ(rabbitOnConnected = () => undefined, appName: string = this.options.appName) {
    this.queue.push(() => rabbitmq(this.config, { appName, rabbitOnConnected }));
    return this;
  }

  withHoneyBadger(o: any = this.options.honeyBadger) {
    this.queue.push(() => honeybadger(this.config, o));
    return this;
  }

  withNewrelic() {
    const logger = getLogger('orka');
    logger.warn(
      `withNewrelic is deprecated and will be removed. ` +
        `Newrelic will be initialized by default if NEW_RELIC_LICENCE_KEY is found in env`
    );
    return this;
  }

  withKafka() {
    this.queue.push(() => kafka(this.config.kafka));
    return this;
  }

  withMongoDB() {
    this.queue.push(() => mongodb(this.config));
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
    return this.use(() => {
      let routes = require(path.resolve(m));
      routes = routes.default && Object.keys(routes).length === 1 ? routes.default : routes;
      return router(routes);
    });
  }

  // Return a request handler callback instead of starting the server
  // Usefull for testing
  async callback() {
    const _logger = getLogger('orka');
    try {
      await this.initTasks();
      const koa = await import('./initializers/koa');
      const app = koa.getApp();
      this.initMiddleWare(app);
      return koa.callback(app, this.middlewares);
    } catch (e) {
      _logger.error(e);
      process.exit(1);
    }
  }

  async initTasks() {
    while (this.queue.length) {
      await this.queue.shift()();
    }
    return this;
  }

  async initMiddleWare(app) {
    const logger = getLogger('orka');
    while (this.koaTasks.length) {
      let m = await this.koaTasks.shift()(app, this.config);
      m = lodash.flatten([m]).filter(lodash.identity);
      m.forEach(__ => this.middlewares.push(__));
    }
    logger.info(
      `Using ${this.middlewares.length} middleware: [${this.middlewares.map(x => x.name || '').join(', ')}]...`
    );
    return this;
  }

  async start(port: number = this.config.port) {
    const _logger = getLogger('orka');
    try {
      _logger.info(`Initializing orka processing ${this.queue.length} tasks and ${this.koaTasks.length} koa tasks...`);
      await this.initTasks();
      const koa = await import('./initializers/koa');
      const app = koa.getApp();
      await this.initMiddleWare(app);
      this.server = await koa.listen(app, port, this.middlewares, (logger = _logger) => {
        logger.info(`Server listening to http://localhost:${port}/`);
        logger.info(`Server environment: ${this.config.nodeEnv}`);
      });
    } catch (e) {
      _logger.error(e);
      process.exit(1);
    }
    return this;
  }

  async stop() {
    const _logger = getLogger('orka');
    assert(this.server, 'Application is not started');
    _logger.info('Shutting down server');
    this.server.close();
  }
}
