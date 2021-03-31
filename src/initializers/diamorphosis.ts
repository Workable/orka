import * as diamorphosis from 'diamorphosis';
import { OrkaOptions } from '../typings/orka';
import { defaultTo, isBoolean } from 'lodash';
import { alsSupported } from '../utils';

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
    appName: '',
    ...config.newRelic
  };
  config.datadog = {
    blacklistedPaths: ['/health'],
    ...config.datadog
  };
  config.prometheus = {
    enabled: false,
    gatewayUrl: '',
    ...config.prometheus,
    timeSummary: {
      enabled: true,
      labels: ['flow', 'flowType'],
      type: 'external',
      name: 'flow_duration_seconds',
      help: 'Flow duration in seconds',
      ageBuckets: 10,
      maxAgeSeconds: 60,
      ...config.prometheus?.timeSummary
    },
    eventSummary: {
      enabled: true,
      labels: ['event', 'eventType'],
      type: 'external',
      name: 'events',
      help: 'Custom events, eg: event occurences, event lengths',
      ageBuckets: 10,
      maxAgeSeconds: 60,
      ...config.prometheus?.eventSummary
    }
  };
  config.printLogo = defaultTo(config.printLogo, true);
  config.log = {
    pattern: '%[[%d] [%p] %c%] %x{logTracer} %m',
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
    outbound: {
      blacklistedPathRegex: new RegExp('^/v0.4/traces$', 'i'),
      request: {
        enabled: true
      }
    },
    color: true,
    styles: [],
    headersRegex: '^X-.*',
    maxBodyValueChars: undefined,
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
  config.requestContext = {
    enabled: alsSupported(),
    logKeys: ['requestId', 'visitor'],
    ...config.requestContext
  };
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
