import * as diamorphosis from 'diamorphosis';
import { OrkaOptions } from '../typings/orka';

export default (config, orkaOptions: Partial<OrkaOptions>) => {
  config.nodeEnv = config.nodeEnv || 'development';
  config.honeybadgerApiKey = config.honeybadgerApiKey || '';
  config.newRelicLicenseKey = '';
  config.printLogo = config.printLogo || true;
  config.log = {
    pattern: '%[[%d] [%p] %c%] %m',
    level: 'debug',
    ...config.log
  };
  config.port = config.port || 3000;
  config.allowedOrigins = config.allowedOrigins || ['localhost', 'lvh.me'];
  config.traceHeaderName = config.traceHeaderName || 'X-Request-Id';
  config.headersRegex = config.headersRegex || '^X-.*';
  config.blacklistedErrorCodes = config.blacklistedErrorCodes || [404];
  config.riviere = config.riviere || true;
  diamorphosis(orkaOptions.diamorphosis);
};
