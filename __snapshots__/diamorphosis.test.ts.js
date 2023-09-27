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
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ],
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
      "maxAgeSeconds": 60,
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ]
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
    "headersRegex": "(^X-.*)|cf-ray"
  },
  "healthCheck": {
    "kafka": false,
    "redis": false
  },
  "visitor": {
    "cookie": "",
    "setCookie": false
  },
  "kafka": {
    "brokers": [],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "log": {
      "level": "info",
      "errorToWarn": [
        "The group is rebalancing, re-joining",
        "Response Heartbeat(key: 12, version: 3)"
      ]
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
    },
    "connectionTimeout": 1000,
    "authenticationTimeout": 1000
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
    "options": {}
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
    "idleTimeoutMillis": 10000,
    "connectionTimeoutMillis": 0,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "workers": {
    "retryDelay": 3600000,
    "initializationCheckDelay": 1000
  },
  "growthbook": {
    "apiHost": "https://cdn.growthbook.io",
    "clientKey": ""
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ],
    "istioTraceContextHeaders": {
      "enabled": true,
      "headers": [
        "x-request-id",
        "x-b3-traceid",
        "x-b3-spanid",
        "x-b3-parentspanid",
        "x-b3-sampled",
        "x-b3-flags",
        "x-ot-span-context"
      ]
    },
    "headerPropagation": {
      "enabled": true,
      "headers": [
        "cf-ray"
      ]
    }
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
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ],
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
      "maxAgeSeconds": 60,
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ]
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
    "headersRegex": "(^X-.*)|cf-ray"
  },
  "healthCheck": {
    "kafka": false,
    "redis": false
  },
  "visitor": {
    "cookie": "",
    "setCookie": false
  },
  "kafka": {
    "brokers": [],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "log": {
      "level": "info",
      "errorToWarn": [
        "The group is rebalancing, re-joining",
        "Response Heartbeat(key: 12, version: 3)"
      ]
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
    },
    "connectionTimeout": 1000,
    "authenticationTimeout": 1000
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
    "options": {}
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
    "idleTimeoutMillis": 10000,
    "connectionTimeoutMillis": 0,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "workers": {
    "retryDelay": 3600000,
    "initializationCheckDelay": 1000
  },
  "growthbook": {
    "apiHost": "https://cdn.growthbook.io",
    "clientKey": ""
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ],
    "istioTraceContextHeaders": {
      "enabled": true,
      "headers": [
        "x-request-id",
        "x-b3-traceid",
        "x-b3-spanid",
        "x-b3-parentspanid",
        "x-b3-sampled",
        "x-b3-flags",
        "x-ot-span-context"
      ]
    },
    "headerPropagation": {
      "enabled": true,
      "headers": [
        "cf-ray"
      ]
    }
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
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ],
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
      "maxAgeSeconds": 60,
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ]
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
    "headersRegex": "(^X-.*)|cf-ray"
  },
  "healthCheck": {
    "kafka": false,
    "redis": false
  },
  "visitor": {
    "cookie": "",
    "setCookie": false
  },
  "kafka": {
    "brokers": [],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "log": {
      "level": "info",
      "errorToWarn": [
        "The group is rebalancing, re-joining",
        "Response Heartbeat(key: 12, version: 3)"
      ]
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
    },
    "connectionTimeout": 1000,
    "authenticationTimeout": 1000
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
    "options": {}
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
    "idleTimeoutMillis": 10000,
    "connectionTimeoutMillis": 0,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "workers": {
    "retryDelay": 3600000,
    "initializationCheckDelay": 1000
  },
  "growthbook": {
    "apiHost": "https://cdn.growthbook.io",
    "clientKey": ""
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ],
    "istioTraceContextHeaders": {
      "enabled": true,
      "headers": [
        "x-request-id",
        "x-b3-traceid",
        "x-b3-spanid",
        "x-b3-parentspanid",
        "x-b3-sampled",
        "x-b3-flags",
        "x-ot-span-context"
      ]
    },
    "headerPropagation": {
      "enabled": true,
      "headers": [
        "cf-ray"
      ]
    }
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
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ],
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
      "maxAgeSeconds": 60,
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ]
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
    "headersRegex": "(^X-.*)|cf-ray"
  },
  "healthCheck": {
    "kafka": false,
    "redis": false
  },
  "visitor": {
    "cookie": "",
    "setCookie": false
  },
  "kafka": {
    "brokers": [],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "log": {
      "level": "info",
      "errorToWarn": [
        "The group is rebalancing, re-joining",
        "Response Heartbeat(key: 12, version: 3)"
      ]
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
    },
    "connectionTimeout": 1000,
    "authenticationTimeout": 1000
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
    "options": {}
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
    "idleTimeoutMillis": 10000,
    "connectionTimeoutMillis": 0,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "workers": {
    "retryDelay": 3600000,
    "initializationCheckDelay": 1000
  },
  "growthbook": {
    "apiHost": "https://cdn.growthbook.io",
    "clientKey": ""
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ],
    "istioTraceContextHeaders": {
      "enabled": true,
      "headers": [
        "x-request-id",
        "x-b3-traceid",
        "x-b3-spanid",
        "x-b3-parentspanid",
        "x-b3-sampled",
        "x-b3-flags",
        "x-ot-span-context"
      ]
    },
    "headerPropagation": {
      "enabled": true,
      "headers": [
        "cf-ray"
      ]
    }
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
    "headersRegex": "(^X-.*)|cf-ray"
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
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ],
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
      "maxAgeSeconds": 60,
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ]
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
    "cookie": "",
    "setCookie": false
  },
  "kafka": {
    "brokers": [],
    "groupId": "",
    "clientId": "",
    "ssl": true,
    "log": {
      "level": "info",
      "errorToWarn": [
        "The group is rebalancing, re-joining",
        "Response Heartbeat(key: 12, version: 3)"
      ]
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
    },
    "connectionTimeout": 1000,
    "authenticationTimeout": 1000
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
    "options": {}
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
    "idleTimeoutMillis": 10000,
    "connectionTimeoutMillis": 0,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "workers": {
    "retryDelay": 3600000,
    "initializationCheckDelay": 1000
  },
  "growthbook": {
    "apiHost": "https://cdn.growthbook.io",
    "clientKey": ""
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ],
    "istioTraceContextHeaders": {
      "enabled": true,
      "headers": [
        "x-request-id",
        "x-b3-traceid",
        "x-b3-spanid",
        "x-b3-parentspanid",
        "x-b3-sampled",
        "x-b3-flags",
        "x-ot-span-context"
      ]
    },
    "headerPropagation": {
      "enabled": true,
      "headers": [
        "cf-ray"
      ]
    }
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
      "level": "info",
      "errorToWarn": [
        "The group is rebalancing, re-joining",
        "Response Heartbeat(key: 12, version: 3)"
      ]
    },
    "sasl": {
      "mechanism": "",
      "username": "",
      "password": ""
    },
    "connectionTimeout": 1000,
    "authenticationTimeout": 1000
  },
  "healthCheck": {
    "kafka": true,
    "redis": true
  },
  "visitor": {
    "cookie": "cookie",
    "setCookie": false
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
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ],
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
      "maxAgeSeconds": 60,
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ]
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
    "headersRegex": "(^X-.*)|cf-ray"
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
    "options": {}
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
    "idleTimeoutMillis": 10000,
    "connectionTimeoutMillis": 0,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "workers": {
    "retryDelay": 3600000,
    "initializationCheckDelay": 1000
  },
  "growthbook": {
    "apiHost": "https://cdn.growthbook.io",
    "clientKey": ""
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ],
    "istioTraceContextHeaders": {
      "enabled": true,
      "headers": [
        "x-request-id",
        "x-b3-traceid",
        "x-b3-spanid",
        "x-b3-parentspanid",
        "x-b3-sampled",
        "x-b3-flags",
        "x-ot-span-context"
      ]
    },
    "headerPropagation": {
      "enabled": true,
      "headers": [
        "cf-ray"
      ]
    }
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
      "level": "info",
      "errorToWarn": [
        "The group is rebalancing, re-joining",
        "Response Heartbeat(key: 12, version: 3)"
      ]
    },
    "sasl": {
      "mechanism": "",
      "username": "",
      "password": ""
    },
    "connectionTimeout": 1000,
    "authenticationTimeout": 1000
  },
  "healthCheck": {
    "kafka": true,
    "redis": true
  },
  "visitor": {
    "cookie": "cookie",
    "setCookie": false
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
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ],
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
      "maxAgeSeconds": 60,
      "percentiles": [
        0.05,
        0.5,
        0.9,
        0.95,
        0.999
      ]
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
    "headersRegex": "(^X-.*)|cf-ray"
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
    "options": {}
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
    "idleTimeoutMillis": 10000,
    "connectionTimeoutMillis": 0,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
    }
  },
  "workers": {
    "retryDelay": 3600000,
    "initializationCheckDelay": 1000
  },
  "growthbook": {
    "apiHost": "https://cdn.growthbook.io",
    "clientKey": ""
  },
  "requestContext": {
    "enabled": true,
    "logKeys": [
      "requestId",
      "visitor",
      "correlationId"
    ],
    "istioTraceContextHeaders": {
      "enabled": true,
      "headers": [
        "x-request-id",
        "x-b3-traceid",
        "x-b3-spanid",
        "x-b3-parentspanid",
        "x-b3-sampled",
        "x-b3-flags",
        "x-ot-span-context"
      ]
    },
    "headerPropagation": {
      "enabled": true,
      "headers": [
        "cf-ray"
      ]
    }
  }
}
