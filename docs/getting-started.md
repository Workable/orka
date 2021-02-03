---
layout: default
title: Getting Started
nav_order: 1
---

# Orka
{: .no_toc }
## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Installation

`npm install @workablehr/orka`

## Philosophy

Orka's main philosophy is to use convention over configuration to simplify the bootstap of new servers.

It integrates with many databases, brokers and services with little configuration overhead.

It has some sensible defaults, but tries to be as unopinionated as possible. You can structure your project any way you want.

## Usage

```js
const { orka } = require('@workablehr/orka');

// these options are the defaults
orka({
  typescript: false,
  routesPath: path.resolve('./config/routes'),
  diamorphosis: {
    configFolder: path.resolve('config'),
    configPath: path.resolve('config/config.js'),
    envFolder: path.resolve('config/env')
    loadDotEnv: ['development']
  },
  beforeMiddleware: async (app, config) => [], // return array of Middlewares or one Middleware
  afterMiddleware: async (app, config) => [], // return array of Middlewares or one Middleware
  beforeStart: [] // function/functions to run before starting the server,
  rabbitOnConnected: ()=>{},
  kafkaProducer: {} // configuration to go into kafka connection if needed to overwrite defaults
  errorHandler: (ctx, err, {omitErrorKeys}) => [err, { state: omit(ctx.state, omitErrorKeys) }] // what to log in case of http error
  omitErrorKeys:[], // query or body keys to omit from logging
  riviereContext: (ctx)=>{} // return context to log in every http log
}).start();

```

Below we are explaining these options in more detail:

### Typescript

Orka supports typescript. Actually Orka is written in typescript.
To simplify your development with typescript Orka will

- initialise [tsconfig-pats/register](https://www.npmjs.com/package/tsconfig-paths).
  This will read the paths from tsconfig.json and convert node's module loading calls into to physcial file paths that node can load.
- initialise [source-map-support/register](https://www.npmjs.com/package/source-map-support).
  This module provides source map support for stack traces in node via the V8 stack trace API. So your stack traces will resolve to your .ts files.

An example of a tsconfig.json file that works greatly with orka:

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "lib": ["es2017", "esnext.asynciterable"],
    "rootDir": "../src",
    "outDir": "../build",
    "sourceRoot": "../src",
    "noImplicitAny": false,
    "removeComments": false,
    "noLib": false,
    "skipLibCheck": true,
    "preserveConstEnums": true,
    "declaration": true,
    "suppressImplicitAnyIndexErrors": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "baseUrl": ".",
    "paths": {
      "*": ["./*", "./app/*", "./app/services/*"]
    },
    "noUnusedLocals": true
  },
  "include": ["**/*.ts", "**/*.d.ts"],
  "exclude": ["node_modules"]
}
```

### routesPath

The path to your routes file to declare all your http apis.
See [routing](https://workable.github.io/orka/routing) for more details.

An example route.js file:

```js
const ResourceController = require('../app/controllers/resource-controller');
module.exports = {
  get: {
    'api/v1/resource': ResourceController.get
  },
  post: {
    'api/v1/resource': ResourceController.post
  }
};
```

or in typescript:

```ts
import { ResourceController } from 'controllers/resource-controller';

export default {
  get: {
    'api/v1/resource': ResourceController.get
  },
  post: {
    'api/v1/resource': ResourceController.post
  }
};
```

### Diamorphosis

Orka uses [diamorphosis](https://www.npmjs.com/package/diamorphosis) to load configuration from files and environment variables.

For more see [Configuration](https://workable.github.io/orka/configuration).

An example of a config/config.js file is the below:

```js
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

in typescript similarly:

```ts
export default {
  app: {
    name: 'my-application'
  }
  ...
}
```

### beforeMiddleware and afterMiddleware

Orka by default adds some default koa middleware (see [middleware](https://workable.github.io/orka/middleware)). You can add some more middleware either before or after the default ones

eg:

```js
orka({
  beforeMiddleware: (app, config) => {
    app.keys = config.keys; // To be used with a session middleware for example
    return [
      async (ctx, next) => {
        ctx.body = 'default body if no middleware matches';
        await next();
      }
    ];
  }
});
```

### beforeStart

Before the server is actually started and after all tasks have run (integrations initialised).

eg:

```js
orka({
  beforeStart(config) {
    if (config.env !== 'test') {
      // register some prometheus metrics
      prometheus.registerSummary('external', 'time', `Flow timings in millis`, ['flow', 'flowType']);
      prometheus.registerGauge('external', 'counter', `Count events and how often they happen`, ['flow', 'flowType']);
    }
  }
});
```

### rabbitOnConnected

Create/Subscribe to some queues after rabbitMQ is initialised. This is critical to happen here and not in beforeStart because
rabbitOnConnected will be called again if rabbitMQ is reconnected after a connection loss.

eg:

```js
orka({
  rabbitOnConnected: () => {
    new ExampleHandler('example_queue');
    getRabbit().bindToTopic('example_queue', '*.example_queue');
  }
});
```

### kafkaProducer

Configuration that will go into the default kafka producer created. See [kafka.js producer docs](https://kafka.js.org/docs/producing)

### errorHandler

To control what is logged in console (and to honeybadger if enabled) during http errors caught in koa middleware.

```js
async (ctx, err, orkaOptions) => [err, { state: omit(ctx.state, orkaOptions.omitErrorKeys) }];
```

### omitErrorKeys

An array of keys (strings) from ctx.request.query, ctx.request.body that should not be logged in console (or honeybadger)

### riviereContext

Context to add in each http log.

Eg:

```js
orka({
  riviereContext: (ctx: Koa.Context) => {
    user: ctx.state?.verifiedToken?.sub;
  }
});
```

## Builder API

Instead of using the constructor api you can use the builder one.
Using the builder you can access a fluent API for initiliazing your server.

```js
const { builder } = require('@workablehr/orka');

builder({…some static options here…})
  .forTypeScript()
  .withRabbitMQ('my-app-name')
  .withHoneyBadger()
  .withMongoDB()
  .withRedis()
  .use((app, config) => async (ctx, next) => {…before middleware…})
  .useDefaults() // default Middleware riviere, cors, etc.
  .use((app, config) => async (ctx, next) => {…after middleware…})
  .routes('./routes/my-routes')
  .start(8080)
```

The constructor is using the builder internally with sensible defaults.
You can controll wether your server connects with any external service through environment variables as we will see in [Configuration](https://workable.github.io/orka/configuration)
