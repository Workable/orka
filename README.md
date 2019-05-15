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
  allowedOrigins: ['localhost', 'lvh.me'], // for cors
  traceHeaderName: 'X-Request-Id', // for logging in http requests
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
    configPaht: path.resolve('config/config.js'),
    envFolder: path.resolve('config/env')
    loadDotEnv: ['development']
  },
  beforeMiddleware: [],
  afterMiddleware: []
}).start();

// You can also save some literal deaults eg appName inside config eg:

config = {
  orka: {
    appName: 'appName'
  }
}

// this way you can update some configuration with envs only.
```

For detailed usage please see the examples
