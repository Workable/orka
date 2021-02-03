---
layout: default
title: Routing
nav_order: 3
---

# Routing
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}


Orka is using [fast-koa-router](https://www.npmjs.com/package/fast-koa-router) to support routing.

A routes example:

```js
const { getLogger } = require('../../build');

module.exports = {
  get: {
    '/api/v1/:key': [async (ctx, next) => (ctx.body = 'ok')],
    '/*': async function (ctx, next) {
      ctx.body = 'Nothing here';
      ctx.status = 404;
    }
  },
  post: {
    '/test': async (ctx, next) => (ctx.body = 'ok')
  },
  policy: {
    '/api': async (ctx, next) => {
      if (ctx.request.query.secret_key === 'success') {
        return await next();
      }
      throw { status: 401, message: 'Unauthorized' };
    }
  },
  prefix: {
    '/api': async (ctx, next) => {
      await next();
      ctx.body = ctx.body + ' changed by prefix';
    }
  }
};
```

## Get, Post, Put, Delete, Patch

Each key can contain one or multiple koa compatible middlewares. The order they are called is preserved.
In every http request one route is matched and only it's middlewares are used.

## Policy

Used to add a generic authentication/authorization middleware to a route regardless of method.


## Prefix

Used to add in multiple routes some middleware in their beggining. It differs from policies because prefix will not match a route if a matching get,post,put,patch or delete route exists.


## Star Symbol

Sometimes you need to have a fallback if no route matches with the requested url. You can have routes that end with a star.


For more details please refer to the documentation of [fast-koa-router](https://www.npmjs.com/package/fast-koa-router)

