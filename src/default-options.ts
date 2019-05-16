import * as path from 'path';

export default {
  appName: '',
  typescript: false,
  honeyBadger: {
    developmentEnvironments: ['development', 'test']
  },
  routesPath: path.resolve('./config/routes'),
  diamorphosis: {
    configFolder: path.resolve('config'),
    configPath: '',
    envFolder: '',
    loadDotEnv: ['development']
  },
  beforeMiddleware: [],
  afterMiddleware: []
};
