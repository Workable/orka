---
layout: default
title: Honeybadger
parent: Integrations
nav_order: 8
---

# Honeybadger
## Connecting

`HONEYBADGER_API_KEY={key} node app.js`

Just setting the env var in config will suffice.

## Logging errors

You can use orka's logger see [logs](https://workable.github.io/orka/logs) to log errors to HB

```js
logger.error(error, 'augment error message', { customKey: {}, action: 'action', component: 'logger-category' });
```

any custom keys given will be added to context sent to HB.
