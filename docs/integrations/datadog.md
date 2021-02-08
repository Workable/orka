---
layout: default
title: Datadog
parent: Integrations
nav_order: 7
---

# Datadog

Datadog is optional. In order to enable it install the dependency first:

```sh
npm i dd-trace
```

then add `DD_SERVICE` and `DD_ENV` in your environment

## Configuration

```js
//config/config.js

module.exports = {
  datadog: {
    blacklistedPaths: ['/health']
  }
};
```

By default health enpoint is blacklisted.
You can overwrite this by giving a comma seperated list in your env (`DATADOG_BLACKLISTED_PATHS`) or by changing the value in your config.js file.
