

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
  honeyBadgerApiKey: '', // will not add honeybadger by default
  newRelicLicenseKey: '', // will not add newrelic by default
  log : {
    pattern: '%[[%d] [%p] %c%] %m',
    level: 'debug',
  },
  port: 3000,
  cors: {
    allowedOrigins: ['localhost', 'lvh.me'],
    credentials: true, // Adds cors needed for exchanging cookies over https.
    …
  },
  traceHeaderName: 'X-Request-Id', // for logging in http requests
  headersRegex: '^X-.*', // for logging headers in http requests
  blacklistedErrorCodes: [404] // will not send to honeybadger requests with this status
}
```

```js
const { orka } = require('@workablehr/orka');

// these options are the defaults
orka({
  appName: '',
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
  beforeMiddleware: [],
  afterMiddleware: [],
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
  .use(async (ctx, next) => {…before middleware…})
  .useDefaults() // riviere, cors, etc.
  .use(async (ctx, next) => {…after middleware…})
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
