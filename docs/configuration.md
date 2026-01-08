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

An example of how configuration is actually loaded:

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

```sh
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
If you are in development .env is also loaded into memory and overwrites any value.
The most important precedence have actual environment variables.

Priority with examples:

`NODE_ENV=PRODUCTION QUEUE_PREFETCH=1 node app.js`

config.queue.prefetch value will be 1.

`NODE_ENV=PRODUCTION node app.js`

config.queue.prefetch value will be 20 from env/production.json.

`node app.js`

config.queue.prefetch value will be 30 from .env

## Default config values

By default orka loads your config file with some default values and some empty keys.
Those keys are needed in order for you to be able to overwrite them with env variables.
However if not overwritten they are not used. Eg. if QUEUE_URL is not set rabbitMQ will
never be initialized.

You can find the default values below:

```json
{
  "nodeEnv": "development",
  "app": {
    "env": "development"
  },
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
      "percentiles": [0.05, 0.5, 0.9, 0.95, 0.999],
      "maxAgeSeconds": 60
    },
    "eventSummary": {
      "enabled": true,
      "labels": ["event", "eventType"],
      "type": "external",
      "name": "events",
      "help": "Custom events, eg: event occurences, event lengths",
      "percentiles": [0.05, 0.5, 0.9, 0.95, 0.999],
      "ageBuckets": 10,
      "maxAgeSeconds": 60
    }
  },
  "printLogo": true,
  "log": {
    "pattern": "%[[%d] [%p] %c%] %x{requestId}%m %x{logTracer}",
    "level": "debug",
    "console": true,
    "json": false,
    "categories": {
      "orka.kafka.consumer": "info",
      "orka.kafka.producer": "info",
      "orka": "debug",
      "kafka": "debug",
      "initializing": "debug"
    }
  },
  "port": 3000,
  "allowedOrigins": ["localhost", "lvh.me"],
  "traceHeaderName": "X-Orka-Request-Id",
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
      "errorToWarn": ["The group is rebalancing, re-joining", "Response Heartbeat(key: 12, version: 3)"]
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
    "options": {
      // options that go into rabbit-queue constructor
      "scheduledPublish": true
    }
  },
  "mongodb": {
    "url": "",
    "options": {
      // options that go into mongoose connect
      // https://mongoosejs.com/docs/connections.html#options
    }
  },
  "postgres": {
    "url": "",
    "useSsl": true,
    "sslConfig": {
      "rejectUnauthorized": false,
      "ca": "",
      "cert": "",
      "key": ""
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
  "requestContext": {
    "enabled": true,
    "logKeys": ["requestId", "visitor"],
    "propagatedHeaders": {
      "enabled": true,
      "headers": [
        "cf-ray",
        "x-request-id",
        "x-b3-traceid",
        "x-b3-spanid",
        "x-b3-parentspanid",
        "x-b3-sampled",
        "x-b3-flags",
        "x-ot-span-context"
      ]
    }
  },
  "workers": {
    "retryDelay": 3600000,
    "initializationCheckDelay": 1000
  },
  "visitor": {
    "enabled": true,
    "setCookie": false,
    "cookie": "wmc",
    "maxAge": "7d",
    "secure": true
  }
}
```

You can overwrite those values with various ways:

- setting them in your config.js file
- setting the corresponding env variable
- setting the corresponding env variable in .env for development
- setting them in env/{NODE_ENV}.(js \| json) for the corresponding environment

eg:

`HONEYBADGER_API_KEY={key} node app.js`

will connect to honeybadger for error logging without any further configuration needed.

Refer to [Integrations](https://workable.github.io/orka/integrations/index) for the relevant documentation.
