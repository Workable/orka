---
layout: default
title: Bull
parent: Integrations
nav_order: 9
---
# Bull
## Bull Queues

Bull is an optional dependency. Should you want to use it in your project with Orka, install it first

```
npm i bull
```

Bull uses `Redis` as a backend, in order to configure redis with bull, you have 2 options:

1. Reuse the connection properties of your existing redis configuration ( `config.redis...` )
2. Configure bull specific connection options like so:

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
        }
      ]
    }
  }
}
```

The `options` in both cases can be any of [JobOptions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/b4330da8ebd802197809ca6f349961a506679d3d/types/bull/index.d.ts#L369).

