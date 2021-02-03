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
