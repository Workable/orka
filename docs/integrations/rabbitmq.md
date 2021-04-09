---
layout: default
title: RabbitMQ
parent: Integrations
nav_order: 3
---

# RabbitMQ

Orka uses [rabbit-queue](https://www.npmjs.com/package/rabbit-queue) under the hood.
It will connect with a rabbitMQ instance if a QUEUE_URL is provided.

eg:

```js
//config/config.js
module.exports = {
  queue: {
    url: 'amqp://localhost',
    frameMax: 0x1000, // default frameMax in bytes
    prefetch: 100,
    connectDelay: 5000 // delay when retrying connections in ms
  }
};
```

## BaseQueueHandler

```js
// app/services/queue-handlers/example-handler.js
const { BaseQueueHandler } = require('rabbit-queue');
const { getRabbit } = require('../../build');

class ExampleHandler extends BaseQueueHandler {
  constructor(queueName, logEnabled = true) {
    const config = require('./config');
    super(queueName, getRabbit(), {
      logEnabled,
      retries: 3, // 3 retries
      retryDelay: 1000 // in ms
    });
  }

  async handle(message) {
    console.log(message);
  }

}

module.exports = ExampleHandler;
```

Orka will try to reconnect every time the connection drops with a connecDelay delay in ms.
So it is important to initialize any queues on rabbitOnConnected:

```js
orka({
  rabbitOnConnected: () => {
    new ExampleHandler('example_queue');
    getRabbit().bindToTopic('example_queue', '*.example_queue');
  }
});
```

## RequestContext
When you use `BaseQueueHandler`, orka by default runs the message handling inside `runWithContext` function and appends the `correlationId` of the message in the context.

That means that every log of your consumer will contain the `correlationId` of the message and that you can also add any variable you want in the context.

Example:
```js
const { BaseQueueHandler } = require('rabbit-queue');
const { getRabbit, getRequestContext } = require('@workablehr/orka');

async function handler(m) {
  logger.info('Var: ', getRequestContext().get('test-var'));
}

class ExampleHandler extends BaseQueueHandler {
  constructor(queueName, logEnabled = true) {
    const config = require('./config');
    super(queueName, getRabbit(), {
      logEnabled,
      retries: 3, // 3 retries
      retryDelay: 1000 // in ms
    });
  }

  async handle(message) {
    getRequestContext().set('test-var', 'orka');
    logger.info(message);
    await handler(message);
  }

}

// In the above example if we receive a message with correlationId=xxx, and message="hello" it will log:
// [xxx] hello
// [xxx] Var: orka
```

Note: In the above example only `correlationId` is logged by default. If you want to have the `test-var` automatically logged on each log entry, you need to include it on your configuration `requestContext.logKeys`. For more, see the [Log Tracer](https://workable.github.io/orka/request-context.html#log-tracer) docs.
