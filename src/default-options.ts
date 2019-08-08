import * as path from 'path';
import * as Koa from 'koa';

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
  },
  beforeMiddleware: [],
  afterMiddleware: [],
  beforeStart: [],
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
  rabbitOnConnected: () => undefined,
  errorHandler: (ctx: Koa.Context, err: Error) => undefined
};
