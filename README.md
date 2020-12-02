                O          .
             O            ' '
               o         '   .
             o         .'
          __________.-'       '...___
       .-'                      ###  '''...__
      /   a###                 ##            ''--.._ ______
      '.                      #     ########        '   .-'
        '-._          ..**********####  ___...---'''\   '
            '-._     __________...---'''             \   l
                \   |                                 '._|
                 \__;

# Orka

A node.js framework to quickly bootstrap new servers.

## Installation

`npm install @workablehr/orka`

## Usage

Orka uses some defaults for the below values in your config.js

```js
config = {
  nodeEnv :'development';
  app: {
    name: 'orka', // will be used as newrelic name, rabbit-queue prefix
    env: 'demo' // will be used as newrelic, honeybadger env - defaults to NODE_ENV
  },
  mongodb: {
    url: '',
    options: {}
  },
  redis: {
    url:'',
    options: {
      tls: {     // If those fileds are empty they will not be passed in
        ca: [],  // Redis driver. This way you can have the same app working
        cert: '',// with a redis that support tls and a redis that doesn't with
        key: ''  // environment variable changes only.
      }
    }
  }
  honeybadger:{
    apiKey: '', // will not add honeybadger by default
  }
  newRelicLicenseKey: '', // will not add newrelic by default
  log : {
    pattern: '%[[%d] [%p] %c%] %m',
    level: 'debug',
  },
  port: 3000,
  cors: {
    allowedOrigins: ['localhost', 'lvh.me'],
    credentials: true, // Adds cors needed for exchanging cookies over https.
    publicPrefixes: ['/publicEndpoints/foo/bar'] // ctx.path prefixes that will return access-control-allow-origin: *
    …
  },
  traceHeaderName: 'X-Request-Id', // for logging in http requests
  visitor: { orka: true, cookie : 'wmc' }, // for adding visitor id in ctx.state
  headersRegex: '^X-.*', // for logging headers in http requests
  blacklistedErrorCodes: [404] // will not send to honeybadger requests with this status
}
```

```js
const { orka } = require('@workablehr/orka');

// these options are the defaults
orka({
  appName: '', // defaults to config.app.name
  typescript: false,
  honeyBadger: {
    developmentEnvironments: ['development', 'test']
  },
  routesPath: path.resolve('./config/routes'),
  diamorphosis: {
    configFolder: path.resolve('config'),
    configPath: path.resolve('config/config.js'),
    envFolder: path.resolve('config/env')
    loadDotEnv: ['development']
  },
  beforeMiddleware: async (app, config) => [], // return array of Middlewares or one Middleware
  afterMiddleware: async (app, config) => [], // return array of Middlewares or one Middleware
  beforeStart: [] // functions to run before start
}).start();

// this way you can update some configuration with envs only.
```

Using the builder you can access a fluent API for initiliazing your server.

```js
const { builder } = require('@workablehr/orka');

builder({…some static options here…})
  .forTypeScript()
  .withRabbitMQ('my-app-name')
  .withHoneyBadger({…})
  .withMongoDB()
  .withRedis()
  .use((app, config) => async (ctx, next) => {…before middleware…})
  .useDefaults() // riviere, cors, etc.
  .use((app, config) => async (ctx, next) => {…after middleware…})
  .routes('./routes/my-routes')
  .start(8080)
```

For detailed usage please see the examples.

To run the examples:

- clone orka project
- npm install
- npm run build
- you should be ready to run one of the examples locally. E.g.:
  `node examples/simple-example/app.js`

## Kafka
If you're going to use kafka from a MacOS, you'll need to add the following to your bash_profile/zshrc file
```
export LDFLAGS="-L/usr/local/opt/libiconv/lib"
export CPPFLAGS="-I/usr/local/opt/libiconv/include"
```

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
const { middlewares: { validateBody, validateQueryString } } = require('@workablehr/orka');

module.exports = {
  get: {
    '/users': [validateQueryString(SOME_SCHEMA), async (ctx, next) => {
      // Do something
    }]
  },
  post: {
    '/users': [validateBody(SOME_SCHEMA), async (ctx, next) => {
      // Do something
    }]
  },
};
```
## Metrics Middleware
It supports exporting custom application metrics that can be picked by *Prometheus*.
In order to use this middleware you should also enable the *prometheus plugin* described in the following section.

Example route configuration

```js
const { middlewares: { metrics } } = require('@workablehr/orka');

module.exports = {
  get: {
    '/metrics': metrics,
    '/users': async (ctx, next) => {
      ctx.body = await User.find();
    }
  }
};
```
## Prometheus metrics
Prometheus is optional. In order to enable it install the dependency first:

```sh
npm i prom-client
```
And add to your configuration

```js
{
  prometheus:{
    enabled: true
  }
}
```

It can either be used in conjunction with the `metrics` middleware (pull mode) or if you wish to use it in a non web context, using the *PushGateway* via the provided `#push()` method.

The `#push()` method will fail with an error, unless you configure the push gateway url:

```js
{
  prometheus:{
    enabled: true,
    gatewayUrl: 'http://your.push.gateway'
  }
}
```

Bull is configured to export bull queue depth/failed metrics, so if you use Bull, 
you should also enable Prometheus, otherwise you will receive some complaints in the 
logs.

## Bull Queues
Bull is an optional dependency. Should you want to use it in your project with Orka, install it first
```
npm i bull
```
Bull uses `Redis` as a backend, in order to configure redis with bull, you have 2 options:
1. Reuse the connection properties of your existing redis configuration ( `config.redis...` )
2. Configure bull specific connection options like so:
```js
{
  bull: {
    redis: {
      url: '',
      tls: {
        ca: '',
        cert: '',
        key: ''
      }
    }
  }
}
```
To configure your application queues, use the following configuration:
```js
{
  bull: {
    queue: {
      options: {
        removeOnComplete: true // This is applied to all queues
      },
      queues: [
        {
          name: 'queue_one',
          options: {}
        },
        {
          name: 'queue_two',
          options: { delay: 15000 } // This is applied to queue_two
        }
      ]
    }
  }
}
```
The `options` in both cases can be any of [JobOptions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/b4330da8ebd802197809ca6f349961a506679d3d/types/bull/index.d.ts#L369).

## Request Context
Orka by default exposes a Request Context to the app.

It can be used for setting/getting variables that can be accessible in every code file (within the request's life). It uses nodeJS `async_hooks` to store this information.

By default it appends `requestId` and `visitor` (if you have the option `config.visitor.orka` enabled) in the request context. The `requestId` is retrieved using the option `config.traceHeaderName`

### Log Tracer
If the Request Context is enabled, orka by default appends `requestId` and `visitor` to all the application logs automatically.


### Configuration
If you don't specify anything in your `config.requestContext` it defaults to:

```js
{
  "requestContext": {
    "enabled": true
    "logKeys": ["requestId", "visitor"]  // These are the keys that will be appended automatically to your logs
  }
}
```

### getRequestContext
This method can be used to access the request context within your app.

Returns:
A Map<string, any> with the current request context

e.g.
```js
import {getRequestContext} from '@workablehr/orka'
```

### Examples
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
