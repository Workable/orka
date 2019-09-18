import * as diamorphosis from 'diamorphosis';
import { OrkaOptions } from '../typings/orka';
import { get } from 'lodash';

export default (config, orkaOptions: Partial<OrkaOptions>) => {
  config.nodeEnv = config.nodeEnv || 'development';
  config.honeybadgerApiKey = config.honeybadgerApiKey || '';
  config.honeybadgerEnvironment = config.honeybadgerEnvironment || '';
  config.printLogo = config.printLogo || true;
  config.log = {
    pattern: '%[[%d] [%p] %c%] %m',
    level: 'debug',
    ...config.log
  };
  config.port = config.port || 3000;
  config.allowedOrigins = config.allowedOrigins || ['localhost', 'lvh.me'];
  config.traceHeaderName = config.traceHeaderName || 'X-Request-Id';
  config.blacklistedErrorCodes = config.blacklistedErrorCodes || [404];
  config.riviere = {
    enabled: get(config, 'riviere.enabled') || true,
    color: get(config, 'riviere.color') || true,
    styles: get(config, 'riviere.styles') || ['extended'],
    headersRegex: get(config, 'riviere.headersRegex') || '^X-.*',
    ...config.riviere
  };
  diamorphosis(orkaOptions.diamorphosis);
  config.honeybadgerEnvironment = config.honeybadgerEnvironment || config.nodeEnv;
};
