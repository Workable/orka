---
layout: default
title: Redis
parent: Integrations
nav_order: 4
---

# Redis

Orka uses [redis](https://www.npmjs.com/package/redis) under the hood.
It will connect with redis if a REDIS_URL is provided.
It also supports tls connections with the corresponding configuration:

```js
// config/config.js
module.exports = {
  url: 'redis://localhost:6379/',
  redis: {
    options: {
      tls: {
        ca: "",
        cert: "",
        key: ""
      }
  }};
```

## Usage

Example:

```js
const { getRedis } = require('@workablehr/orka');
const { promisify } = require('util');

async function demo() {
  await promisify(redis.set.bind(redis))('key', 'some key');
  await promisify(redis.get.bind(redis))('key');
}
```

## Create custom connections

Sometimes the default connection from orka is not enough and you want to create more connections:

```js
const { createRedisConnection } = require('@workablehr/orka');

// You could pass a different configuration here from the default connection
const connection = createRedisConnection(config.redis);
```
