import * as diamorphosis from 'diamorphosis';
import { OrkaOptions } from '../typings/orka';

export default (config, orkaOptions: Partial<OrkaOptions>) => {
  config.nodeEnv = config.nodeEnv || 'development';
  (config.honeybadger = {
    apiKey: '',
    environment: config.nodeEnv,
    filterStatus: '',
    ...config.honeybadger
  }),
    (config.printLogo = config.printLogo || true);
  config.log = {
    pattern: '%[[%d] [%p] %c%] %m',
    level: 'debug',
    consoleLogging: true,
    jsonLogging: false,
    ...config.log
  };
  config.port = config.port || 3000;
  config.allowedOrigins = config.allowedOrigins || ['localhost', 'lvh.me'];
  config.traceHeaderName = config.traceHeaderName || 'X-Request-Id';
  config.blacklistedErrorCodes = config.blacklistedErrorCodes || [404];
  config.riviere = {
    enabled: true,
    color: true,
    styles: ['extended'],
    headersRegex: '^X-.*',
    ...config.riviere
  };
  diamorphosis(orkaOptions.diamorphosis);
};
