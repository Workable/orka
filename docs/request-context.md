---
layout: default
title: Request Context
nav_order: 6
---

# Request Context
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Request Context

Orka by default exposes a Request Context to the app.

It can be used for setting/getting variables that can be accessible in every code file (within the request's life). It uses nodeJS `async_hooks` to store this information.

By default it appends in the request context: `requestId`, `visitor` (if you have the option `config.visitor.cookie`), `ddSpan`(if you have DataDog enabled),
and `propagatedHeaders` that holds [Istio trace context headers](https://istio.io/latest/docs/tasks/observability/distributed-tracing/overview/#trace-context-propagation) (if you have the option `config.requestContextl.enabled`).
The `requestId` is retrieved using the option `config.traceHeaderName`

### Log Tracer

If the Request Context is enabled, orka by default appends `requestId`, `correlationId` and `visitor` to all the application logs automatically.

### Header Propagation

Header propagation enabled by default as long as the current nodejs version supports AsyncLocalStorage (async_hooks).

If option `config.requestContext.propagatedHeaders` is enabled, orka propagates some [Istio trace context headers](https://istio.io/latest/docs/tasks/observability/distributed-tracing/overview/#trace-context-propagation) and cloudflare `cf-ray`
from incoming http requests to:
- outbound http requests
- rabbitmq messages
- kafka messages

By default the following headers are propagated:
- "cf-ray"
- "x-request-id"
- "x-b3-traceid"
- "x-b3-spanid"
- "x-b3-parentspanid"
- "x-b3-sampled"
- "x-b3-flags"
- "x-ot-span-context"
- "x-depth"

This list can be modified by changing `config.requestContext.propagatedHeaders.headers`.

### Configuration

If you don't specify anything in your `config.requestContext` it defaults to:

```js
{
  "requestContext": {
    "enabled": true,
    "logKeys": ["requestId", "visitor", "correlationId", "propagatedHeaders"],  // These are the keys that will be appended automatically to your logs
    "propagatedHeaders": {
      "enabled": true,
      "headers": ["cf-ray", "x-request-id", "x-b3-traceid", "x-b3-spanid", "x-b3-parentspanid", "x-b3-sampled", "x-b3-flags", "x-ot-span-context"]
    }
  }
}
```

### getRequestContext

This method can be used to access the request context within your app.

Returns:
A Map<string, any> with the current request context

e.g.

```js
import { getRequestContext } from '@workablehr/orka';
```

#### Usage

Using the request context on another file:

```js
// src/app.js
builder({...})
  .useDefaults()
  .start()

// src/services/a-service.js called after a HTTP call
import {getRequestContext, getLogger} from '@workablehr/orka'

export const method = async () => {
  const ctx = getRequestContext();
  const id = ctx.get('requestId');
  // id = a-uid
  getLogger('log').info('An informative log');
  // Logs for json
  // {
  //   "timestamp":"2020-11-18T19:38:14.810Z",
  //   "severity":"INFO",
  //   "categoryName":"log",
  //   "message":"An informative log",
  //   "context":{
  //     "requestId": "a-uid"
  //   }
  // }
  // Logs for console
  // ["2020-11-18T19:38:14.810Z"] [INFO] [log] [a-uid] An informative log
};
```

Example of setting a variable in request context:

```js
// src/app.js
builder({...})
  .useDefaults()
  .start()

// src/config/routes.js
import {getRequestContext} from '@workablehr/orka'

module.exports = {
  get: {
    '/test': async (ctx, next) => {
      await service.method();
    },
  },
  prefix: {
    '/foo': async (ctx, next) => {
      getRequestContext().set('var', 'test');
      await next();
    }
  }
};

// src/services/a-service.js called after a HTTP call
import {getRequestContext} from '@workablehr/orka'

export const method = async () => {
  console.log(getRequestContext().get('var')); // prints test
};
```

### runWithContext

This method can be used to execute a callback within a context.

e.g.

```js
import { runWithContext } from '@workablehr/orka';
```

#### Usage

Using the request context on another file:

```js

// src/handler.js
import {runWithContext} from '@workablehr/orka'

module.exports = {
  test: () => {
    const store = Map([['requestId', 'trace-id']])
    return runWithContext(store, service.method, 'arg1', 'arg2');
  }
};

// src/services/a-service.js called after a HTTP call
import {getRequestContext} from '@workablehr/orka'

export const method = async (arg1, arg2) => {
  console.log(getRequestContext().get('requestId')); // trace-id
};
```
