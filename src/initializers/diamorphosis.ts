import * as diamorphosis from 'diamorphosis';
import { OrkaOptions } from '../typings/orka';
import { defaultTo, isBoolean } from 'lodash';

export default (config, orkaOptions: Partial<OrkaOptions>) => {
  config.nodeEnv = config.nodeEnv || 'development';
  config.app = {
    env: '',
    ...config.app
  };
  config.clouddebugger = false;
  config.honeybadger = {
    apiKey: '',
    ...config.honeybadger
  };
  config.newRelic = {
    appName: ''
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
    inbound: {
      request: {
        enabled: false
      }
    },
    color: true,
    styles: [],
    headersRegex: '^X-.*',
    ...config.riviere
  };
  if (config.kafka) {
    config.kafka.producer = {
      brokers: [...(config.kafka.producer?.brokers || [])],
      certificates: {
        key: '',
        cert: '',
        ca: '',
        ...config.kafka.producer?.certificates
      },
      sasl: {
        username: '',
        password: '',
        ...config.kafka.producer?.sasl
      },
      ...config.kafka.producer
    };
  }
  diamorphosis(orkaOptions.diamorphosis);
  config.app.env = config.app.env || config.nodeEnv;

  // Override kafka producer config with defaults if brokers is not set
  if (config.kafka && (!config.kafka.producer?.brokers || config.kafka.producer.brokers.length === 0)) {
    config.kafka.producer = {
      ...config.kafka.producer,
      brokers: config.kafka.brokers,
      certificates: config.kafka.certificates,
      sasl: config.kafka.sasl
    };
  }

  if (config.log.console === '') {
    config.log.console = !config.log.json;
  } else if (!isBoolean(config.log.console)) {
    config.log.console = config.log.console === 'true';
  }

  if (config.riviere.styles.length === 0 && config.log.json) {
    config.riviere.styles = ['json'];
  }
};
