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
import clouddebugger from './initializers/clouddebugger';
import { createRedisConnection } from './initializers/redis';
import { getLogger } from './initializers/log4js';
import riviere from './initializers/riviere';
import addRequestId from './initializers/koa/add-request-id';
import addVisitorId from './initializers/koa/add-visitor-id';
import parseQuerystring from './initializers/koa/parse-querystring';
import addRequestContext from './initializers/koa/add-request-context';
import _defaults from './default-options';
import { OrkaOptions } from './typings/orka';
import assert = require('assert');
import { Server } from 'http';
import logo from './initializers/logo';
import kafka from './initializers/kafka';
import prometheus from './initializers/prometheus';
import bull from './initializers/bull';
import postgres from './initializers/postgres';
import * as Koa from 'koa';
import { AsyncLocalStorage } from 'async_hooks';
import type WorkerType from './initializers/worker';
import { traceFastKoaRouter } from './initializers/datadog';

export default class OrkaBuilder {
  public static INSTANCE: OrkaBuilder;
  options: Partial<OrkaOptions>;
  config: any;
  defaultRouter: ReturnType<typeof router>;
  middlewares: Middleware<any>[];
  koaTasks: ((
    app: Koa<any, {}>,
    config: any
  ) => Middleware<any> | Middleware<any>[] | Promise<Middleware<any>> | Promise<Middleware<any>[]>)[];
  errorHandler: any;
  queue: (() => Promise<void> | void | any)[];
  server: Server;
  als: AsyncLocalStorage<Map<string, any>>;

  constructor(options, config, errorHandler, als) {
    this.options = options;
    this.config = config;
    this.middlewares = [];
    this.koaTasks = [];
    this.errorHandler = errorHandler;
    this.queue = [];
    this.als = als;
    if (!OrkaBuilder.INSTANCE) {
      OrkaBuilder.INSTANCE = this;
    }
  }

  use(
    task: (
      app: Koa<any, {}>,
      config: any
    ) => Middleware<any> | Middleware<any>[] | Promise<Middleware<any>> | Promise<Middleware<any>[]> = () => []
  ) {
    this.koaTasks.push(task);
    return this;
  }

  useDefaults() {
    this.use(() => addRequestId(this.config));
    if (this.config.requestContext.enabled) {
      this.use(() => addRequestContext(this.als, this.config));
    }
    this.use(() => bodyParser(this.config.bodyParser));
    this.use(() => parseQuerystring);
    this.use(() => riviere(this.config, this.options));
    this.use(() => this.errorHandler(this.config, this.options));
    this.use(
      () =>
        async function koaCompress(...args) {
          await compress()(...args);
        }
    );
    this.useCors();
    if (this.config?.visitor?.cookie) this.use(() => addVisitorId(this.config));
    return this;
  }

  useCors(
    { credentials = undefined, allowedOrigins = this.config.allowedOrigins, publicPrefixes = [] } = this.config.cors ||
      {}
  ) {
    const allowedOrigin = new RegExp(
      '^https?://(www\\.)?([^.]+\\.)?((' +
        allowedOrigins.map(ao => ao.replaceAll('.', '\\.').replaceAll('*', '.*')).join(')|(') +
        '))$'
    );

    return this.use(() =>
      cors({
        origin: (ctx: Context) => {
          const origin = ctx.request.headers.origin || ctx.request.origin;
          if (publicPrefixes.some(p => ctx.path.startsWith(p))) return '*';
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

  withCloudDebugger() {
    if (this.config.clouddebugger) {
      this.queue.push(() => clouddebugger(this.options));
    }
    return this;
  }

  withRabbitMQ(rabbitOnConnected = () => undefined, appName: string = this.options.appName) {
    this.queue.push(() => rabbitmq(this.config, { appName, rabbitOnConnected }));
    return this;
  }

  withHoneyBadger() {
    this.queue.push(() => honeybadger(this.config));
    return this;
  }

  withKafka(options = this.options.kafkaProducer) {
    this.queue.push(() => kafka(this.config, options));
    return this;
  }

  withMongoDB(mongoOnConnected = () => undefined) {
    this.queue.push(() => mongodb(this.config, mongoOnConnected));
    return this;
  }

  withPostgres() {
    this.queue.push(() => postgres(this.config));
    return this;
  }

  withRedis() {
    this.queue.push(() => createRedisConnection(this.config.redis));
    return this;
  }

  withPrometheus(appName: string = this.options.appName) {
    this.queue.push(() => prometheus(this.config, appName));
    return this;
  }

  withBull(appName: string = this.options.appName) {
    this.queue.push(() => bull(this.config, appName));
    return this;
  }

  loadGrowthbookFeatures() {
    this.queue.push(async () => {
      const { createGrowthbook } = require('./initializers/growthbook');
      const gb = createGrowthbook(this.config.growthbook);
      if (!gb) return;

      const logger = getLogger('orka.growthbook');
      await gb
        .loadFeatures()
        .then(() => logger.info('Growthbook features loaded'))
        .catch(e => logger.error('Unable to load features', e));
    });
    return this;
  }

  createWorker(name: string) {
    const Worker: typeof WorkerType = require('./initializers/worker').default;
    return new Worker(this, name);
  }

  with(tasks: ((config: any) => void)[] | ((config: any) => void)) {
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
      this.defaultRouter = router(routes);
      traceFastKoaRouter(this.defaultRouter.routes);
      return this.defaultRouter;
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
        logger.info(`Server environment: ${this.config.app.env}`);
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
