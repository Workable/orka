import * as path from 'path';
import * as Koa from 'koa';
import OrkaBuilder from './orka-builder';
import { Middleware } from 'koa';
import { omit } from 'lodash';

export default {
  appName: '',
  typescript: false,
  honeyBadger: {
    developmentEnvironments: ['development', 'test']
  },
  routesPath: path.resolve('./config/routes'),
  logoPath: path.resolve('./config/logo.txt'),
  diamorphosis: {
    configFolder: path.resolve('config'),
    configPath: '',
    envFolder: '',
    loadDotEnv: ['development']
  } as { configFolder: string; configPath?: string; envFolder?: string; loadDotEnv?: string[] },
  beforeMiddleware: (
    app: Koa<any, {}>,
    config: any
  ): Middleware<any> | Middleware<any>[] | Promise<Middleware<any>> | Promise<Middleware<any>[]> => [],
  afterMiddleware: (
    app: Koa<any, {}>,
    config: any
  ): Middleware<any> | Middleware<any>[] | Promise<Middleware<any>> | Promise<Middleware<any>[]> => [],
  beforeStart: [] as ((config: any) => void)[] | ((config: any) => void),
  kafka: {
    certificates: {
      key: '',
      cert: '',
      ca: ''
    },
    groupId: '',
    clientId: '',
    brokers: []
  },
  builder: null as OrkaBuilder,
  rabbitOnConnected: () => undefined,
  mongoOnConnected: () => undefined,
  errorHandler: async (
    ctx: Koa.Context,
    err: Error,
    orkaOptions: { omitErrorKeys?: string[] }
  ): Promise<[string | Error, ...any[]]> => [err, { state: omit(ctx.state, orkaOptions.omitErrorKeys) }],
  omitErrorKeys: [],
  riviereContext: (ctx: Koa.Context) => ({})
};
