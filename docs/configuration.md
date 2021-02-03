---
layout: default
title: Configuration
nav_order: 2
---

# Configuration
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Diamorphosis

Orka uses [diamorphosis](https://www.npmjs.com/package/diamorphosis) to load configuration from files and environment variables.

An example of a config/config.js file is the below:

### config/config.js

```js
// config/config.js
module.exports = {
  app: {
    name: 'my-application'
  },
  mongodb: {
    url: 'mongodb://localhost/my-app'
  },
  queue: {
    prefetch: 5,
    url: 'amqp://localhost',
    frame_max: 0x10000,
    max_retries: 3,
    retry_delay: 30000,
    reply_retry_delay: 3000,
    connect_delay: 5000,
    max_priority: 10
  }
  ...
};
```

### app.js

```js
// app.js
orka({
  diamorphosis: { // the default config.js path is config/config.js so no need to overwrite it
    configFolder: path.resolve('config'),
    configPath: path.resolve('config/config.js'),
    envFolder: path.resolve('config/env')
    loadDotEnv: ['development']
  })
```

### config/env/production.json

```js
  // config/env/production.json
{
  "queue": {
    "prefetch": 20
  }
}

```

### .env

The names in .env and in your actual env should be uppercase snake case

```
//.env
QUEUE_PREFETCH=30
```

## Priority

There are 4 different levels where you can add configuration:

- config/config.js
- config/env/{NODE_ENV}.(js\|json)
- .env
- actual env variable

Every value you have in config/config.js will be overwritten by values in config/env/{NODE_ENV}.js.
If you are in development (by default) .env is also loaded into memory and overwrites any value.
The most important precedence have actual environment variables.

EG:

`NODE_ENV=PRODUCTION QUEUE_PREFETCH=1 node app.js`

config.queue.prefetch value will be 1.

`NODE_ENV=PRODUCTION node app.js`

config.queue.prefetch value will be 20 from env/production.json.

`node app.js`

config.queue.prefetch value will be 30 from .env

## Default config values

```json
{
  "nodeEnv": "development",
  "app": {
    "env": "development"
  },
  "clouddebugger": false,
  "honeybadger": {
    "apiKey": "",
    "developmentEnvironments": ["development", "test"]
  },
  "newRelic": {
    "appName": ""
  },
  "datadog": {
    "blacklistedPaths": ["/health"]
  },
  "prometheus": {
    "enabled": false,
    "gatewayUrl": "",
    "timeSummary": {
      "enabled": true,
      "labels": ["flow", "flowType"],
      "type": "external",
      "name": "flow_duration_seconds",
      "help": "Flow duration in seconds",
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    },
    "eventSummary": {
      "enabled": true,
      "labels": ["event", "eventType"],
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
  "allowedOrigins": ["localhost", "lvh.me"],
  "traceHeaderName": "X-Request-Id",
  "blacklistedErrorCodes": [404],
  "riviere": {
    "enabled": true,
    "inbound": {
      "request": {
        "enabled": false
      }
    },
    "outbound": {
      "blacklistedPathRegex": {}
    },
    "color": true,
    "styles": [],
    "headersRegex": "^X-.*"
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
     "options": { // options that go into rabbit-queue constructor
       "scheduledPublish": true
      }
  },
  "mongodb": {
    "url": "",
    "options": { // options that go into mongoose connect
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
}
  "requestContext": {
    "enabled": true,
    "logKeys": ["requestId", "visitor"]
  }
}
```

By default orka adds certain defaults in your config.js file.
The integration ones eg kafka, prometheus, honeybadger etc won't be used unless you also give the relevant key, url etc.

- in config.js
- through env variable

EG:

` HONEYBADGER_API_KEY={key} node app.js`

Will connect to honeybadger for error logging without any further configuration needed.

Refer to [Integrations](https://workable.github.io/orka/integrations/index) for the relevant documentation.
