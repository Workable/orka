---
layout: default
title: PostgreSQL
parent: Integrations
nav_order: 10
---

# PostgreSQL
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

Orka is using [pg](https://node-postgres.com/).

## Installation

pg is an optional dependency. In order to enable it install the dependency first:

```sh
npm i pg
```

It will connect to postgres automatically if a connection url is given.

eg:

`POSTGRES_URL={url} node app.js`

## Usage

```js
//config/config.js

module.exports = {
  postgres: {
    url: 'postgres://localhost:5432/orka_development',
    // default values used below. Only include them to overwrite them
    poolSize: 50,
    useSsl: true,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 0,
    statementTimeout: undefined, // default is no timeout
    queryTimeout: undefined // default is no timeout
    sslConfig: {
      rejectUnauthorized: false,
      ca: '',
      cert: '',
      key: '',
  }
};
```

If don't need to support ssl

```js
//config/config.js

module.exports = {
  postgres: {
    url: 'postgres://localhost:5432/orka_development',
    useSsl: false
  }
};
```

For more information about ssl support look at [node-postgres docs](https://node-postgres.com/features/ssl).

### getPostgresPool

You can call `getPostgresPool` to acquire a new client to communicate with the database.

If you choose to run `client = await pool.connect()` you should ALWAYS release the client using `client.release()` after finishing your operations.

```js
const { getPostgresPool } = require('@workablehr/orka');

const client = await getPostgresPool().connect();
try {
  const res = await client.query('SELECT * FROM users WHERE id = $1', [1]);
  console.log(res.rows[0]);
} finally {
  // Make sure to release the client before any error handling,
  // just in case the error handling itself throws an error.
  client.release();
}
```

Alternatively, you can use `pool.query` for single queries.

```js
const { getPostgresPool } = require('@workablehr/orka');

const pool = getPostgresPool();
const results = await pool.query('SELECT NOW() as now');
```

### withPostgresTransaction

Orka also provides a transaction wrapper that handles begin, commit & rollback of a transaction if something fails. In addition, it releases the client uppon completion

```js
const { withPostgresTransaction } = require('@workablehr/orka');

const callback = async c => {
  await c.query('INSERT INTO users VALUES(1, "orka user")');
  await c.query('INSERT INTO memberships VALUES(1, 1, 3)');
};

await withPostgresTransaction(callback);
```
