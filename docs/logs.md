---
layout: default
title: Logs
nav_order: 4
---

# Logs

## Configuration

Orka is using [log4js](https://www.npmjs.com/package/log4js) under the hood

By default the below config is used:

```json
{
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
  }
}
```

You don't have to change both console, json. Updating only json will suffice.
eg:

`LOG_JSON=true node app.js`

In case you want both types of logs though you can do it with:

`LOG_CONSOLE=true LOG_JSON=true node app.js`

## Usage

Orka exposes a getLogger method:

```js
//app/services/my-service.js
const { getLogger } = require('@workablehr/orka');

const logger = getLogger('services.my-service');

...

logger.info('msg');
```


## Changing logger level


By updating the config.log.categories you can affect the log level of a specific log category:

e.g.:
`LOG_CATEGORIES_ORKA_KAFKA=warn LOG_JSON=false node app.js`

Note that log4js supports changing all orka.* log levels not specifically set to a different level by changing 
the orka level. 
Changing the orka level will not change the orka.kafka.consumer and orka.kafka.producer level as those levels are 
specifically set to info by default. You need to overwrite those values too in order to change them.

e.g.:

`LOG_CATEGORIES_ORKA_KAFKA=warn LOG_CATEGORIES_ORKA_KAFKA_CONSUMER=error node app.js`


## Axios errors

When you log an axios error, as an argument or inside a context object, orka logs only these fields of it:
`name`, `message`, `code`, `status`, the request `config.method`, `config.baseURL` and `config.url` (without the query string),
and the `response.status`, `response.statusText` and `response.data` (unless the data is a stream or a buffer).
The request headers, auth, body and the raw request are not logged. The same applies to the context sent to Honeybadger.

## Propagated Header Logging

See: [RequestContext #Header Propagation](https://workable.github.io/orka/request-context.html#header-propagation)
