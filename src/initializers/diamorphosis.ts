import * as diamorphosis from 'diamorphosis';
import { OrkaOptions } from '../typings/orka';
import { defaultTo } from 'lodash';

export default (config, orkaOptions: Partial<OrkaOptions>) => {
  config.nodeEnv = config.nodeEnv || 'development';
  config.honeybadger = {
    apiKey: '',
    environment: '',
    filterStatus: '',
    ...config.honeybadger
  };
  config.printLogo = defaultTo(config.printLogo, true);
  config.log = {
    pattern: '%[[%d] [%p] %c%] %m',
    level: 'debug',
    console: '',
    json: false,
    ...config.log
  };
  config.port = config.port || 3000;
  config.allowedOrigins = config.allowedOrigins || ['localhost', 'lvh.me'];
  config.traceHeaderName = config.traceHeaderName || 'X-Request-Id';
  config.blacklistedErrorCodes = config.blacklistedErrorCodes || [404];
  config.riviere = {
    enabled: true,
    color: true,
    styles: [],
    headersRegex: '^X-.*',
    ...config.riviere
  };
  diamorphosis(orkaOptions.diamorphosis);
  config.honeybadger.environment = config.honeybadger.environment || config.nodeEnv;

  if (config.log.console === '') {
    config.log.console = !config.log.json;
  }

  if (config.riviere.styles.length === 0 && config.log.json) {
    config.riviere.styles = ['json'];
  }
};
