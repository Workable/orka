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
    "json": false
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


