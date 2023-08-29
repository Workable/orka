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
- [errorHandler](./getting-started.md#errorhandler) (Handles errors thrown in any middleware added afterwards)
- [koa-compress](https://www.npmjs.com/package/koa-compress)
- [koa2-cors](https://www.npmjs.com/package/koa2-cors)
- parseQuerystring (Uses [qs](https://www.npmjs.com/package/qs) and adds an object to `ctx.state.query` with the parsed attributes)
- addVisitorId (adds a visitorId in `ctx.state.visitor` from cookie `ctx.visitor.cookie`)

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
using the joi validation module. joi is now a dependency of orka.

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

## Add Visitor Middleware

This middleware checks request's cookies and extract the cookie with name `config.visitor.cookie`, it parses it and add it to `ctx.state.visitor`.

### Options

**config.visitor.enabled**

If this is set to `false`, orka will not this middleware. Defaults to `true`.

**config.visitor.cookie**

This is the cookie name that the middleware will try to get/set. Defaults to `wmc`.

**config.visitor.setCookie**

If this is set to `true`, the middleware will create and add a new visitor cookie with name `config.visitor.cookie`. Defaults to `false`.

**config.visitor.maxAge**

Requires: `config.visitor.setCookie=true`

This is the cookie's max age. Defaults to `7d`.

**config.visitor.secure**

Requires: `config.visitor.setCookie=true`

It forces secure cookies in context. Use this when you only want to use `secure=true`. Defaults to `true`.

**config.visitor.getCookieDomain**

Requires: `config.visitor.setCookie=true`

You can use this method to set the preferable cookie domain.

Default:
```js
// If hostname is www.google.com the cookie domain will be .google.com
const getCookieDomain = ctx => domain((ctx.origin && new URL(ctx.origin).hostname) || ctx.hostname)
```
## Growthbook middleware

It is responsible for acquiring the growthbook instance, loading the features and setting the instance in the 
`ctx.state.growthbook` to be used by other middlewares.

Example route configuration

```js
const { middlewares: { growthbook } } = require('@workablehr/orka');

module.exports = {
  get: {
    '/endpoint': async (ctx, next) => {
      ctx.body = ctx.state.growthbook.isOn('featureA') ? 'ON' : 'OFF';
    }
  },
  prefix: {
    '/': growthbook
  }
};
```

If you need to set attributes you can do by accessing the `ctx.state.growthbook` to another endpoint and using the 
`setAttributes` method of growthbook instance.
