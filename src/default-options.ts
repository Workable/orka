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
    get configPath() {
      return this._configPath || path.resolve(`${this.configFolder}/config.js`);
    },
    set configPath(path) {
      this._configPath = path;
    },
    get envFolder() {
      return this._envPath || path.resolve(`${this.configFolder}/env`);
    },
    set envFolder(path) {
      this._envPath = path;
    },
    loadDotEnv: ['development']
  },
  beforeMiddleware: [],
  afterMiddleware: []
};
