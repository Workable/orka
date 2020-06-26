import * as diamorphosis from 'diamorphosis';
import { OrkaOptions } from '../typings/orka';
import { defaultTo, isBoolean } from 'lodash';

export const producerConfigOverrides = config => {
  const {
    KAFKA_PRODUCER_BROKERS,
    KAFKA_PRODUCER_CERTIFICATES_KEY,
    KAFKA_PRODUCER_CERTIFICATES_CERT,
    KAFKA_PRODUCER_CERTIFICATES_CA,
    KAFKA_PRODUCER_SASL_USERNAME,
    KAFKA_PRODUCER_SASL_PASSWORD
  } = process.env;

  if (!KAFKA_PRODUCER_BROKERS) {
    return {
      ...config.kafka.producer,
      brokers: config.kafka.brokers,
      certificates: config.kafka.certificates,
      sasl: config.kafka.sasl
    };
  }

  return {
    ...config.kafka.producer,
    brokers: KAFKA_PRODUCER_BROKERS?.split(','),
    certificates: {
      key: KAFKA_PRODUCER_CERTIFICATES_KEY,
      cert: KAFKA_PRODUCER_CERTIFICATES_CERT,
      ca: KAFKA_PRODUCER_CERTIFICATES_CA
    },
    sasl: {
      username: KAFKA_PRODUCER_SASL_USERNAME,
      password: KAFKA_PRODUCER_SASL_PASSWORD
    }
  };
};

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
  config.app.env = config.app.env || config.nodeEnv;
  // Separate kafka producer/consumer connection strings
  if (config.kafka) {
    config.kafka.producer = producerConfigOverrides(config);
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
