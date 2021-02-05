---
layout: default
title: Prometheus
nav_order: 5
parent: Integrations
---

# Prometheus

Prometheus is optional. In order to enable it install the dependency first:

```sh
npm i prom-client
```

And add to your configuration

```js
{
  prometheus: {
    enabled: true;
  }
}
```

## Default config

```js
//config/config.js
module.exports = {
  prometheus: {
    enabled: false,
    gatewayUrl: '',
    timeSummary: {
      enabled: true,
      labels: ['flow', 'flowType'],
      type: 'external',
      name: 'flow_duration_seconds',
      help: 'Flow duration in seconds',
      ageBuckets: 10,
      maxAgeSeconds: 60
    },
    eventSummary: {
      enabled: true,
      labels: ['event', 'eventType'],
      type: 'external',
      name: 'events',
      help: 'Custom events, eg: event occurences, event lengths',
      ageBuckets: 10,
      maxAgeSeconds: 60
    }
  }
};
```

## Prometheus metrics

It can either be used in conjunction with the `metrics` [middleware](https://workable.github.io/orka/middleware.html#metrics-middleware) (pull mode) or if you wish to use it in a non web context, using the _PushGateway_ via the provided `#push()` method.

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

## Built in summaries

For convenience orka comes with 2 summaries a timeSummary and and eventSummary.
You can change the labels, names by overwriting the config.

So orka exposes 2 helper methods do send data to those summaries:

```js
const { helpers } = require('@workablehr/orka');

const start = helpers.logMetrics.start();
//... do sth time consuming
helpers.logMetrics.end(start, 'flow', 'flowType', 'correlationId');

// or log an event
helpers.logmetrics.recordMetric('event', 'eventType', 10);
```
