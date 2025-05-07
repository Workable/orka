---
layout: default
title: BullMQ
parent: Integrations
nav_order: 9
---
# BullMQ
## BullMQ Queues

BullMQ is an optional dependency. Should you want to use it in your project with Orka, install it first

```
npm i bullmq
```

BullMQ uses `Redis` as a backend, in order to configure redis with BullMQ, you have 2 options:

1. Reuse the connection properties of your existing redis configuration ( `config.redis...` )
2. Configure BullMQ specific connection options like so:

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
        },
         {
          name: 'rate_limited',
          limiter: { max:  10, duration: 1000 } // rate limited queue
        }
      ]
    }
  }
}
```

The `options` in both cases can be any of [BaseJobOptions](https://api.docs.bullmq.io/interfaces/v5.BaseJobOptions.html).

The `limiter` can be configured according to [limiter](https://api.docs.bullmq.io/classes/v1.Queue.html#limiter).
