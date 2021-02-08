---
layout: default
title: Middleware
nav_order: 5
---
# Middleware
{: .no_toc }
## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}


## Default Middleware

Orka adds by default the following middleware:

- addRequestId (adds ctx.state.requestId from header config.traceHeaderName)
- addRequestContext (enabled by default see [request-context](https://workable.github.io/orka/request-context) )
- [koa-bodyparser](https://www.npmjs.com/package/koa-bodyparser)
- [riviere](https://www.npmjs.com/package/@workablehr/riviere)
- errorHandler (Handles errors thrown in any middleware added afterwards)
- [koa-compress](https://www.npmjs.com/package/koa-compress)
- [koa2-cors](https://www.npmjs.com/package/koa2-cors)
- addVisitorId (adds a visitorId in ctx.state.visitorId from cookie ctx.visitor.cookie)

Any middlewares you add in beforeMiddleware go before this list.
Any middlewares you add in afterMiddleware go after this list.
Orka also adds a last middleware (after your afterMiddleware) for [routing](https://workable.github.io/orka/routing).
## Health Middleware

It supports a health middleware that currently checks the availablity of mongo
configuration and responds wheather the connectivity with the underlying database is stable. This is essential for liveness probes of several cloud providers such as K8s.

Example route configuration

```js
const { middlewares: { health } } = require('@workablehr/orka');

module.exports = {
  get: {
    '/health': health,
    '/users': async (ctx, next) => {
      ctx.body = await User.find();
    }
  }
};
```

## ValidateBody and ValidateQueryString Middlewares

It supports validation middlewares for both body or query string parameters
using the joi validation module. @hapi/joi is now a dependency of orka.

Example route configuration

```js
const {
  middlewares: { validateBody, validateQueryString }
} = require('@workablehr/orka');

module.exports = {
  get: {
    '/users': [
      validateQueryString(SOME_SCHEMA),
      async (ctx, next) => {
        // Do something
      }
    ]
  },
  post: {
    '/users': [
      validateBody(SOME_SCHEMA),
      async (ctx, next) => {
        // Do something
      }
    ]
  }
};
```

## Metrics Middleware

It supports exporting custom application metrics that can be picked by _Prometheus_.
In order to use this middleware you should also enable the _prometheus plugin_ described in the following section.

Example route configuration

```js
const {
  middlewares: { metrics }
} = require('@workablehr/orka');

module.exports = {
  get: {
    '/metrics': metrics,
    '/users': async (ctx, next) => {
      ctx.body = await User.find();
    }
  }
};
```
