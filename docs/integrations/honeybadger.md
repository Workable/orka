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
logger.error(error, 'augment error message', { customKey: {}, action: 'action', component: 'logger-category', tags: ['tag'] });
```

any custom keys given will be added to context sent to HB.

You can add tags in 3 ways:
  - The error has a tags property
  - You pass tags like above
  - You add honeybadgerTags key with array of tags in [requestContext](https://github.com/Workable/orka/blob/b76ca8da9fbc87aa2368f8fe3338d7cfdccac64d/docs/request-context.md?plain=1#L135) 
