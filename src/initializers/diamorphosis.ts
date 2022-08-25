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
    developmentEnvironments: ['development', 'test'],
    ...config.honeybadger
  };
  config.newRelic = {
    appName: '',
    ...config.newRelic
  };
  config.datadog = {
    blacklistedPaths: ['/health', '/metrics'],
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
      // default: 0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999
      percentiles: [0.05, 0.5, 0.9, 0.95, 0.999],
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
      // default: 0.01, 0.05, 0.5, 0.9, 0.95, 0.99, 0.999
      percentiles: [0.05, 0.5, 0.9, 0.95, 0.999],
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
  config.traceHeaderName = config.traceHeaderName || 'X-Orka-Request-Id';
  config.blacklistedErrorCodes = config.blacklistedErrorCodes || [404];
  config.riviere = {
    enabled: true,
    inbound: {
      ...config.riviere?.inbound,
      request: {
        enabled: false,
        ...config.riviere?.inbound?.request
      }
    },
    outbound: {
      blacklistedPathRegex: new RegExp('^/v0.4/traces$', 'i'),
      ...config.riviere?.outbound,
      request: {
        enabled: false,
        ...config.riviere?.outbound?.request
      }
    },
    color: true,
    styles: [],
    headersRegex: '^X-.*',
    maxBodyValueChars: undefined,
    ...config.riviere
  };

  config.healthCheck = {
    kafka: false,
    redis: false,
    ...config.healthCheck
  };

  config.visitor = {
    cookie: '',
    setCookie: false,
    ...config.visitor
  };

  addKafkaConfig(config);
  addRabbitMqConfig(config);
  addMongoDBConfig(config);
  addRedisConfig(config);
  addPostgresConfig(config);
  addWorkersConfig(config);

  config.requestContext = {
    enabled: alsSupported(),
    logKeys: ['requestId', 'visitor', 'correlationId'],
    istioTraceContextHeaders: {
      enabled: true,
      headers: [
        'x-request-id',
        'x-b3-traceid',
        'x-b3-spanid',
        'x-b3-parentspanid',
        'x-b3-sampled',
        'x-b3-flags',
        'x-ot-span-context'
      ],
      ...config.requestContext?.istioTraceContextHeaders
    },
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
      sasl: config.kafka.sasl,
      ssl: config.kafka.ssl
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

function addKafkaConfig(config) {
  config.kafka = {
    brokers: [],
    groupId: '',
    clientId: '',
    ssl: true,
    ...config.kafka,
    log: {
      level: 'info',
      errorToWarn: ['The group is rebalancing, re-joining', 'Response Heartbeat(key: 12, version: 3)'],
      ...config.kafka?.log
    },
    certificates: {
      key: '',
      cert: '',
      ca: [],
      rejectUnauthorized: false,
      ...config.kafka?.certificates
    },
    sasl: {
      mechanism: '',
      username: '',
      password: '',
      ...config.kafka?.sasl
    },
    producer: {
      brokers: [],
      ssl: true,
      ...config.kafka?.producer,
      certificates: {
        key: '',
        cert: '',
        ca: [],
        rejectUnauthorized: false,
        ...config.kafka?.producer?.certificates
      },
      sasl: {
        mechanism: '',
        username: '',
        password: '',
        ...config.kafka?.producer?.sasl
      }
    },
    connectionTimeout: 1000,
    authenticationTimeout: 1000
  };
}

function addRabbitMqConfig(config) {
  config.queue = {
    url: '',
    prefetch: 1,
    connectDelay: 5000,
    ...config.queue,
    options: {
      scheduledPublish: true,
      ...config?.queue?.options
    }
  };
}

function addMongoDBConfig(config) {
  config.mongodb = {
    url: '',
    ...config.mongodb,
    options: {
      ...config?.mongodb?.options
    }
  };
}

function addPostgresConfig(config) {
  config.postgres = {
    url: '',
    poolSize: 50,
    useSsl: true,
    ...config.postgres,
    sslConfig: {
      rejectUnauthorized: false,
      ca: '',
      cert: '',
      key: '',
      ...config.postgres?.sslConfig
    }
  };
}

function addRedisConfig(config) {
  config.redis = {
    url: '',
    ...config.redis,
    options: {
      ...config?.redis?.options,
      tls: {
        ca: '',
        cert: '',
        key: '',
        ...config?.redis?.options?.tls
      }
    }
  };
}

function addWorkersConfig(config) {
  config.workers = {
    retryDelay: 1000 * 60 * 60,
    initializationCheckDelay: 1000,
    ...config.workers
  };
}
