---
layout: default
title: Newrelic
parent: Integrations
nav_order: 6
---

# Newrelic

Newrelic is optional. In order to enable it install the dependency first:

```sh
npm i newrelic
```

and then add a valid license key in your env.

## Connecting

`NEW_RELIC_LICENSE_KEY={key} node app.js`

A default app name will be sent to newrelic:

`${config.app.name} ${config.app.env}`

You can ovewrite it with setting the env variable: `NEW_RELIC_APP_NAME`