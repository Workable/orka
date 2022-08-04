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

## Philosophy

Orka's main philosophy is to use convention over configuration to simplify the bootstap of new servers.

It integrates with many databases, brokers and services with little configuration overhead.

It has some sensible defaults, but tries to be as unopinionated as possible. You can structure your project any way you want.

## Installation

To install orka and start using it:

`npm install @workablehr/orka`

## Usage

Bootstraping a server with orka is pretty simple. A simple server without many dependencies can be started with 2 lines of code!
eg:

```js
// app.js
const { orka } = require('@workablehr/orka');

orka({}).start()
```

Orka expects to find three files by default:

- config/config.js a configuration file
- config/routes.js a file where all http routes are declared
- config/logo.txt (optional) a path where the project's Ascii logo is found.


There are various options you can change to customize your project differently.
The default options used are:

```js
const { orka } = require('@workablehr/orka');

// these options are the defaults
orka({
  typescript: false,
  routesPath: path.resolve('./config/routes'), // path to your routes file
  diamorphosis: {
    configFolder: path.resolve('config'), // path to your config's folder
    configPath: path.resolve('config/config.js'), // path to your config's file
    envFolder: path.resolve('config/env'), // path to your env folder
    loadDotEnv: ['development'] // in which NODE_ENV's to load .env file
  },
  logoPath: path.resolve('./config/logo.txt'), // Where to find the logo file
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

- initialize [tsconfig-pats/register](https://www.npmjs.com/package/tsconfig-paths).
  This will read the paths from tsconfig.json and convert node's module loading calls into to physcial file paths that node can load.
- initialize [source-map-support/register](https://www.npmjs.com/package/source-map-support).
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

You can add some logic before the server is actually started and after all tasks have run (integrations initialized). Some common tasks there include:

- Initialize kafka consumers
- Register prometheus metrics
- Initialize anything needed before the server is up


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

Create/Subscribe to some queues after rabbitMQ is initialized. This is critical to happen here and not in beforeStart because
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

If the error object thrown contains the `logLevel` attribute that accepts all string values of log4js levels:
 `['all' 'trace' 'debug' 'info' 'warn' 'error' 'fatal' 'mark' 'off']`
errorHandler uses that log level to log an error of the corresponding level

### omitErrorKeys

An array of keys (strings) from ctx.request.query, ctx.request.body that should not be logged in console (or honeybadger)

### riviereContext

Orka is using riviere to log http traffic - both inbound and outbound.
You can add some context to be added in each http log.

eg:

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
