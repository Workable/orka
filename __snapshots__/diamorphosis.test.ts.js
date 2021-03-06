exports['Diamorphosis Test should set json/console loggingvariables when nothing is set config should be console:true, json:false, styles:[] 1'] = {
  "nodeEnv": "development",
  "app": {
    "env": "development"
  },
  "clouddebugger": false,
  "honeybadger": {
    "apiKey": "",
    "developmentEnvironments": [
      "development",
      "test"
    ]
  },
  "newRelic": {
    "appName": ""
  },
  "datadog": {
    "blacklistedPaths": [
      "/health",
      "/metrics"
    ]
  },
  "prometheus": {
    "enabled": false,
    "gatewayUrl": "",
    "timeSummary": {
      "enabled": true,
      "labels": [
        "flow",
        "flowType"
      ],
      "type": "external",
      "name": "flow_duration_seconds",
      "help": "Flow duration in seconds",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    },
    "eventSummary": {
      "enabled": true,
      "labels": [
        "event",
        "eventType"
      ],
      "type": "external",
      "name": "events",
      "help": "Custom events, eg: event occurences, event lengths",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    }
  },
  "printLogo": true,
  "log": {
    "pattern": "%[[%d] [%p] %c%] %x{logTracer} %m",
    "level": "debug",
    "console": true,
    "json": false
  },
  "port": 3000,
  "allowedOrigins": [
    "localhost",
    "lvh.me"
  ],
  "traceHeaderName": "X-Orka-Request-Id",
  "blacklistedErrorCodes": [
    404
  ],
  "riviere": {
    "enabled": true,
    "inbound": {
      "request": {
        "enabled": false
      }
    },
    "outbound": {
      "blacklistedPathRegex": {},
      "request": {
        "enabled": false
      }
    },
    "color": true,
    "styles": [],
    "headersRegex": "^X-.*"
  },
  "healthCheck": {
    "kafka": false,
    "redis": false
  },
  "visitor": {
    "cookie": ""
  },
  "kafka": {
    "brokers": [],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "log": {
      "level": "info"
    },
    "certificates": {
      "key": "",
      "cert": "",
      "ca": [],
      "rejectUnauthorized": false
    },
    "sasl": {
      "mechanism": "",
      "username": "",
      "password": ""
    },
    "producer": {
      "brokers": [],
      "ssl": true,
      "certificates": {
        "key": "",
        "cert": "",
        "ca": [],
        "rejectUnauthorized": false
      },
      "sasl": {
        "mechanism": "",
        "username": "",
        "password": ""
      }
    }
  },
  "queue": {
    "url": "",
    "prefetch": 1,
    "connectDelay": 5000,
    "options": {
      "scheduledPublish": true
    }
  },
  "mongodb": {
    "url": "",
    "options": {
      "useNewUrlParser": true,
      "useCreateIndex": true,
      "useFindAndModify": false,
      "useUnifiedTopology": false
    }
  },
  "redis": {
    "url": "",
    "options": {
      "tls": {
        "ca": "",
        "cert": "",
        "key": ""
      }
    }
  },
  "postgres": {
    "url": "",
    "poolSize": 50,
    "useSsl": true,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ]
  }
}

exports['Diamorphosis Test should set json/console loggingvariables when console:not set, json:true, styles:[] shoud be console:false, json:true, styles:["json"] 1'] = {
  "log": {
    "pattern": "%[[%d] [%p] %c%] %x{logTracer} %m",
    "level": "debug",
    "console": false,
    "json": true
  },
  "nodeEnv": "development",
  "app": {
    "env": "development"
  },
  "clouddebugger": false,
  "honeybadger": {
    "apiKey": "",
    "developmentEnvironments": [
      "development",
      "test"
    ]
  },
  "newRelic": {
    "appName": ""
  },
  "datadog": {
    "blacklistedPaths": [
      "/health",
      "/metrics"
    ]
  },
  "prometheus": {
    "enabled": false,
    "gatewayUrl": "",
    "timeSummary": {
      "enabled": true,
      "labels": [
        "flow",
        "flowType"
      ],
      "type": "external",
      "name": "flow_duration_seconds",
      "help": "Flow duration in seconds",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    },
    "eventSummary": {
      "enabled": true,
      "labels": [
        "event",
        "eventType"
      ],
      "type": "external",
      "name": "events",
      "help": "Custom events, eg: event occurences, event lengths",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    }
  },
  "printLogo": true,
  "port": 3000,
  "allowedOrigins": [
    "localhost",
    "lvh.me"
  ],
  "traceHeaderName": "X-Orka-Request-Id",
  "blacklistedErrorCodes": [
    404
  ],
  "riviere": {
    "enabled": true,
    "inbound": {
      "request": {
        "enabled": false
      }
    },
    "outbound": {
      "blacklistedPathRegex": {},
      "request": {
        "enabled": false
      }
    },
    "color": true,
    "styles": [
      "json"
    ],
    "headersRegex": "^X-.*"
  },
  "healthCheck": {
    "kafka": false,
    "redis": false
  },
  "visitor": {
    "cookie": ""
  },
  "kafka": {
    "brokers": [],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "log": {
      "level": "info"
    },
    "certificates": {
      "key": "",
      "cert": "",
      "ca": [],
      "rejectUnauthorized": false
    },
    "sasl": {
      "mechanism": "",
      "username": "",
      "password": ""
    },
    "producer": {
      "brokers": [],
      "ssl": true,
      "certificates": {
        "key": "",
        "cert": "",
        "ca": [],
        "rejectUnauthorized": false
      },
      "sasl": {
        "mechanism": "",
        "username": "",
        "password": ""
      }
    }
  },
  "queue": {
    "url": "",
    "prefetch": 1,
    "connectDelay": 5000,
    "options": {
      "scheduledPublish": true
    }
  },
  "mongodb": {
    "url": "",
    "options": {
      "useNewUrlParser": true,
      "useCreateIndex": true,
      "useFindAndModify": false,
      "useUnifiedTopology": false
    }
  },
  "redis": {
    "url": "",
    "options": {
      "tls": {
        "ca": "",
        "cert": "",
        "key": ""
      }
    }
  },
  "postgres": {
    "url": "",
    "poolSize": 50,
    "useSsl": true,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ]
  }
}

exports['Diamorphosis Test should set json/console loggingvariables when console:true, json:true, styles:[] shoud be console:true, json:true, styles:["json"] 1'] = {
  "log": {
    "pattern": "%[[%d] [%p] %c%] %x{logTracer} %m",
    "level": "debug",
    "console": true,
    "json": true
  },
  "nodeEnv": "development",
  "app": {
    "env": "development"
  },
  "clouddebugger": false,
  "honeybadger": {
    "apiKey": "",
    "developmentEnvironments": [
      "development",
      "test"
    ]
  },
  "newRelic": {
    "appName": ""
  },
  "datadog": {
    "blacklistedPaths": [
      "/health",
      "/metrics"
    ]
  },
  "prometheus": {
    "enabled": false,
    "gatewayUrl": "",
    "timeSummary": {
      "enabled": true,
      "labels": [
        "flow",
        "flowType"
      ],
      "type": "external",
      "name": "flow_duration_seconds",
      "help": "Flow duration in seconds",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    },
    "eventSummary": {
      "enabled": true,
      "labels": [
        "event",
        "eventType"
      ],
      "type": "external",
      "name": "events",
      "help": "Custom events, eg: event occurences, event lengths",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    }
  },
  "printLogo": true,
  "port": 3000,
  "allowedOrigins": [
    "localhost",
    "lvh.me"
  ],
  "traceHeaderName": "X-Orka-Request-Id",
  "blacklistedErrorCodes": [
    404
  ],
  "riviere": {
    "enabled": true,
    "inbound": {
      "request": {
        "enabled": false
      }
    },
    "outbound": {
      "blacklistedPathRegex": {},
      "request": {
        "enabled": false
      }
    },
    "color": true,
    "styles": [
      "json"
    ],
    "headersRegex": "^X-.*"
  },
  "healthCheck": {
    "kafka": false,
    "redis": false
  },
  "visitor": {
    "cookie": ""
  },
  "kafka": {
    "brokers": [],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "log": {
      "level": "info"
    },
    "certificates": {
      "key": "",
      "cert": "",
      "ca": [],
      "rejectUnauthorized": false
    },
    "sasl": {
      "mechanism": "",
      "username": "",
      "password": ""
    },
    "producer": {
      "brokers": [],
      "ssl": true,
      "certificates": {
        "key": "",
        "cert": "",
        "ca": [],
        "rejectUnauthorized": false
      },
      "sasl": {
        "mechanism": "",
        "username": "",
        "password": ""
      }
    }
  },
  "queue": {
    "url": "",
    "prefetch": 1,
    "connectDelay": 5000,
    "options": {
      "scheduledPublish": true
    }
  },
  "mongodb": {
    "url": "",
    "options": {
      "useNewUrlParser": true,
      "useCreateIndex": true,
      "useFindAndModify": false,
      "useUnifiedTopology": false
    }
  },
  "redis": {
    "url": "",
    "options": {
      "tls": {
        "ca": "",
        "cert": "",
        "key": ""
      }
    }
  },
  "postgres": {
    "url": "",
    "poolSize": 50,
    "useSsl": true,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ]
  }
}

exports['Diamorphosis Test should set json/console loggingvariables when console:false, json:true, styles:[] shoud be console:false, json:true, styles:["json"] 1'] = {
  "log": {
    "pattern": "%[[%d] [%p] %c%] %x{logTracer} %m",
    "level": "debug",
    "console": false,
    "json": true
  },
  "nodeEnv": "development",
  "app": {
    "env": "development"
  },
  "clouddebugger": false,
  "honeybadger": {
    "apiKey": "",
    "developmentEnvironments": [
      "development",
      "test"
    ]
  },
  "newRelic": {
    "appName": ""
  },
  "datadog": {
    "blacklistedPaths": [
      "/health",
      "/metrics"
    ]
  },
  "prometheus": {
    "enabled": false,
    "gatewayUrl": "",
    "timeSummary": {
      "enabled": true,
      "labels": [
        "flow",
        "flowType"
      ],
      "type": "external",
      "name": "flow_duration_seconds",
      "help": "Flow duration in seconds",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    },
    "eventSummary": {
      "enabled": true,
      "labels": [
        "event",
        "eventType"
      ],
      "type": "external",
      "name": "events",
      "help": "Custom events, eg: event occurences, event lengths",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    }
  },
  "printLogo": true,
  "port": 3000,
  "allowedOrigins": [
    "localhost",
    "lvh.me"
  ],
  "traceHeaderName": "X-Orka-Request-Id",
  "blacklistedErrorCodes": [
    404
  ],
  "riviere": {
    "enabled": true,
    "inbound": {
      "request": {
        "enabled": false
      }
    },
    "outbound": {
      "blacklistedPathRegex": {},
      "request": {
        "enabled": false
      }
    },
    "color": true,
    "styles": [
      "json"
    ],
    "headersRegex": "^X-.*"
  },
  "healthCheck": {
    "kafka": false,
    "redis": false
  },
  "visitor": {
    "cookie": ""
  },
  "kafka": {
    "brokers": [],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "log": {
      "level": "info"
    },
    "certificates": {
      "key": "",
      "cert": "",
      "ca": [],
      "rejectUnauthorized": false
    },
    "sasl": {
      "mechanism": "",
      "username": "",
      "password": ""
    },
    "producer": {
      "brokers": [],
      "ssl": true,
      "certificates": {
        "key": "",
        "cert": "",
        "ca": [],
        "rejectUnauthorized": false
      },
      "sasl": {
        "mechanism": "",
        "username": "",
        "password": ""
      }
    }
  },
  "queue": {
    "url": "",
    "prefetch": 1,
    "connectDelay": 5000,
    "options": {
      "scheduledPublish": true
    }
  },
  "mongodb": {
    "url": "",
    "options": {
      "useNewUrlParser": true,
      "useCreateIndex": true,
      "useFindAndModify": false,
      "useUnifiedTopology": false
    }
  },
  "redis": {
    "url": "",
    "options": {
      "tls": {
        "ca": "",
        "cert": "",
        "key": ""
      }
    }
  },
  "postgres": {
    "url": "",
    "poolSize": 50,
    "useSsl": true,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ]
  }
}

exports['Diamorphosis Test should set json/console loggingvariables when console:not set, json:true, styles:["simple"] shoud be console:false, json:true, styles:["simple"] 1'] = {
  "log": {
    "pattern": "%[[%d] [%p] %c%] %x{logTracer} %m",
    "level": "debug",
    "console": false,
    "json": true
  },
  "riviere": {
    "enabled": true,
    "inbound": {
      "request": {
        "enabled": false
      }
    },
    "outbound": {
      "blacklistedPathRegex": {},
      "request": {
        "enabled": false
      }
    },
    "color": true,
    "styles": [
      "simple"
    ],
    "headersRegex": "^X-.*"
  },
  "nodeEnv": "development",
  "app": {
    "env": "development"
  },
  "clouddebugger": false,
  "honeybadger": {
    "apiKey": "",
    "developmentEnvironments": [
      "development",
      "test"
    ]
  },
  "newRelic": {
    "appName": ""
  },
  "datadog": {
    "blacklistedPaths": [
      "/health",
      "/metrics"
    ]
  },
  "prometheus": {
    "enabled": false,
    "gatewayUrl": "",
    "timeSummary": {
      "enabled": true,
      "labels": [
        "flow",
        "flowType"
      ],
      "type": "external",
      "name": "flow_duration_seconds",
      "help": "Flow duration in seconds",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    },
    "eventSummary": {
      "enabled": true,
      "labels": [
        "event",
        "eventType"
      ],
      "type": "external",
      "name": "events",
      "help": "Custom events, eg: event occurences, event lengths",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    }
  },
  "printLogo": true,
  "port": 3000,
  "allowedOrigins": [
    "localhost",
    "lvh.me"
  ],
  "traceHeaderName": "X-Orka-Request-Id",
  "blacklistedErrorCodes": [
    404
  ],
  "healthCheck": {
    "kafka": false,
    "redis": false
  },
  "visitor": {
    "cookie": ""
  },
  "kafka": {
    "brokers": [],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "log": {
      "level": "info"
    },
    "certificates": {
      "key": "",
      "cert": "",
      "ca": [],
      "rejectUnauthorized": false
    },
    "sasl": {
      "mechanism": "",
      "username": "",
      "password": ""
    },
    "producer": {
      "brokers": [],
      "ssl": true,
      "certificates": {
        "key": "",
        "cert": "",
        "ca": [],
        "rejectUnauthorized": false
      },
      "sasl": {
        "mechanism": "",
        "username": "",
        "password": ""
      }
    }
  },
  "queue": {
    "url": "",
    "prefetch": 1,
    "connectDelay": 5000,
    "options": {
      "scheduledPublish": true
    }
  },
  "mongodb": {
    "url": "",
    "options": {
      "useNewUrlParser": true,
      "useCreateIndex": true,
      "useFindAndModify": false,
      "useUnifiedTopology": false
    }
  },
  "redis": {
    "url": "",
    "options": {
      "tls": {
        "ca": "",
        "cert": "",
        "key": ""
      }
    }
  },
  "postgres": {
    "url": "",
    "poolSize": 50,
    "useSsl": true,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ]
  }
}

exports['Diamorphosis Test should set json/console loggingvariables when console:true set in process.env shoud be console:true, json:false, styles:[] 1'] = {
  "nodeEnv": "testProcess",
  "kafka": {
    "brokers": [
      "confluent"
    ],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "certificates": {
      "key": "key",
      "cert": "cert",
      "ca": "ca",
      "rejectUnauthorized": false
    },
    "producer": {
      "brokers": [
        "confluent"
      ],
      "ssl": true,
      "topics": {
        "topic1": "topic1"
      },
      "certificates": {
        "key": "key",
        "cert": "cert",
        "ca": "ca",
        "rejectUnauthorized": false
      },
      "sasl": {
        "mechanism": "",
        "username": "",
        "password": ""
      }
    },
    "log": {
      "level": "info"
    },
    "sasl": {
      "mechanism": "",
      "username": "",
      "password": ""
    }
  },
  "healthCheck": {
    "kafka": true,
    "redis": true
  },
  "visitor": {
    "cookie": "cookie"
  },
  "app": {
    "env": "testProcess"
  },
  "clouddebugger": false,
  "honeybadger": {
    "apiKey": "",
    "developmentEnvironments": [
      "development",
      "test"
    ]
  },
  "newRelic": {
    "appName": ""
  },
  "datadog": {
    "blacklistedPaths": [
      "/health",
      "/metrics"
    ]
  },
  "prometheus": {
    "enabled": false,
    "gatewayUrl": "",
    "timeSummary": {
      "enabled": true,
      "labels": [
        "flow",
        "flowType"
      ],
      "type": "external",
      "name": "flow_duration_seconds",
      "help": "Flow duration in seconds",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    },
    "eventSummary": {
      "enabled": true,
      "labels": [
        "event",
        "eventType"
      ],
      "type": "external",
      "name": "events",
      "help": "Custom events, eg: event occurences, event lengths",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    }
  },
  "printLogo": false,
  "log": {
    "pattern": "%[[%d] [%p] %c%] %x{logTracer} %m",
    "level": "fatal",
    "console": true,
    "json": false
  },
  "port": 3000,
  "allowedOrigins": [
    "localhost",
    "lvh.me"
  ],
  "traceHeaderName": "X-Orka-Request-Id",
  "blacklistedErrorCodes": [
    404
  ],
  "riviere": {
    "enabled": false,
    "inbound": {
      "request": {
        "enabled": false
      }
    },
    "outbound": {
      "blacklistedPathRegex": {},
      "request": {
        "enabled": false
      }
    },
    "color": true,
    "styles": [],
    "headersRegex": "^X-.*"
  },
  "queue": {
    "url": "",
    "prefetch": 1,
    "connectDelay": 5000,
    "options": {
      "scheduledPublish": true
    }
  },
  "mongodb": {
    "url": "",
    "options": {
      "useNewUrlParser": true,
      "useCreateIndex": true,
      "useFindAndModify": false,
      "useUnifiedTopology": false
    }
  },
  "redis": {
    "url": "",
    "options": {
      "tls": {
        "ca": "",
        "cert": "",
        "key": ""
      }
    }
  },
  "postgres": {
    "url": "",
    "poolSize": 50,
    "useSsl": true,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ]
  }
}

exports['Diamorphosis Test should set json/console loggingvariables when console:true, json:true set in process.env shoud be console:true, json:false, styles:[] 1'] = {
  "nodeEnv": "testProcess",
  "kafka": {
    "brokers": [
      "confluent"
    ],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "certificates": {
      "key": "key",
      "cert": "cert",
      "ca": "ca",
      "rejectUnauthorized": false
    },
    "producer": {
      "brokers": [
        "confluent"
      ],
      "ssl": true,
      "topics": {
        "topic1": "topic1"
      },
      "certificates": {
        "key": "key",
        "cert": "cert",
        "ca": "ca",
        "rejectUnauthorized": false
      },
      "sasl": {
        "mechanism": "",
        "username": "",
        "password": ""
      }
    },
    "log": {
      "level": "info"
    },
    "sasl": {
      "mechanism": "",
      "username": "",
      "password": ""
    }
  },
  "healthCheck": {
    "kafka": true,
    "redis": true
  },
  "visitor": {
    "cookie": "cookie"
  },
  "app": {
    "env": "testProcess"
  },
  "clouddebugger": false,
  "honeybadger": {
    "apiKey": "",
    "developmentEnvironments": [
      "development",
      "test"
    ]
  },
  "newRelic": {
    "appName": ""
  },
  "datadog": {
    "blacklistedPaths": [
      "/health",
      "/metrics"
    ]
  },
  "prometheus": {
    "enabled": false,
    "gatewayUrl": "",
    "timeSummary": {
      "enabled": true,
      "labels": [
        "flow",
        "flowType"
      ],
      "type": "external",
      "name": "flow_duration_seconds",
      "help": "Flow duration in seconds",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    },
    "eventSummary": {
      "enabled": true,
      "labels": [
        "event",
        "eventType"
      ],
      "type": "external",
      "name": "events",
      "help": "Custom events, eg: event occurences, event lengths",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    }
  },
  "printLogo": false,
  "log": {
    "pattern": "%[[%d] [%p] %c%] %x{logTracer} %m",
    "level": "fatal",
    "console": true,
    "json": true
  },
  "port": 3000,
  "allowedOrigins": [
    "localhost",
    "lvh.me"
  ],
  "traceHeaderName": "X-Orka-Request-Id",
  "blacklistedErrorCodes": [
    404
  ],
  "riviere": {
    "enabled": false,
    "inbound": {
      "request": {
        "enabled": false
      }
    },
    "outbound": {
      "blacklistedPathRegex": {},
      "request": {
        "enabled": false
      }
    },
    "color": true,
    "styles": [
      "json"
    ],
    "headersRegex": "^X-.*"
  },
  "queue": {
    "url": "",
    "prefetch": 1,
    "connectDelay": 5000,
    "options": {
      "scheduledPublish": true
    }
  },
  "mongodb": {
    "url": "",
    "options": {
      "useNewUrlParser": true,
      "useCreateIndex": true,
      "useFindAndModify": false,
      "useUnifiedTopology": false
    }
  },
  "redis": {
    "url": "",
    "options": {
      "tls": {
        "ca": "",
        "cert": "",
        "key": ""
      }
    }
  },
  "postgres": {
    "url": "",
    "poolSize": 50,
    "useSsl": true,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ]
  }
}
