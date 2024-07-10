                O          .
             O            ' '
               o         '   .
             o         .'
          __________.-'       '...___
       .-'                      ###  '''...__
      /   a###                 ##            ''--.._ ______
      '.                      #     ########        '   .-'
        '-._          ..**********####  ___...---'''\   '
            '-._     __________...---'''             \   l
                \   |                                 '._|
                 \__;

# Orka

A modern Node.js framework based on koa@2 that comes powered with RabbitMQ, Kafka, MongoDB and Redis integrations out of the box.

[Getting Started](https://workable.github.io/orka/getting-started)

[Configuration](https://workable.github.io/orka/configuration)

[Routing](https://workable.github.io/orka/routing)

[Logs](https://workable.github.io/orka/logs)

[Middleware](https://workable.github.io/orka/middleware)

[Request Context](https://workable.github.io/orka/request-context)

[Integrations](https://workable.github.io/orka/integrations/index)

[Console](https://workable.github.io/orka/console)

[Extra](https://workable.github.io/orka/extra/index)


## Changelog

### Migrating from orka  1.x.x to 2.xx

- Kakfa implementation has changed to kafka.js see [integrations/kafka](https://workable.github.io/orka/integrations/kafka.html#migrating-from-orka--2xx) for more
- Honeybadger builder example has changed. Instead of calling 
  ```js
  .withHoneyBadger({ developmentEnvironments: ['development', 'test'] })
  ```
  config is now holding the development environments:
  ```json
  "honeybadger": {
    "apiKey": "",
    "developmentEnvironments": ["development", "test"]
  }
  ```
- Visitor cookie won't be used if `config.visitor.enabled` is false even if `config.visitor.cookie` exists
- Deprecated builder method `withNewrelic` is removed. Use config instead to enable newrelic see [integrations/newrelic](https://workable.github.io/orka/integrations/newrelic.html)


### Migrating from orka  2.x to 3.x

- Mongoose version is specified to 6. `useNewUrlParser`, `useUnifiedTopology`, `useFindAndModify`, and `useCreateIndex`
are no longer supported options. Mongoose 6 always behaves as if `useNewUrlParser`, `useUnifiedTopology`, and 
`useCreateIndex` are `true`, and `useFindAndModify` is `false`. 
- Also be sure to check any incompatibilities with libraries using the mongoDB Node.js driver as it derives from the 
Mongoose version.
- For Typescript using app,  Types.ObjectId is now a class, which means you can no longer omit new when creating a new 
ObjectId using new mongoose. 
  ```js 
  new mongoose.Types.ObjectId()
  ```
- Additional advice for breaking changes when migrating to Mongoose 6 can be found at https://mongoosejs.com/docs/migrating_to_6.html 

### Migrating from orka  3.x to 4.x

- Support for older node version pre v18 is dropped. Only v18 and v20+ will be unit tested and guaranteed to work
- Usage of randomUUID that is not supported in many older versions
- Changes in default config: istioTraceHeaders and headerPropagation are deprecated in favor of a generic propagatedHeaders
- Methods kafka.send that was deprecated is removed. Use kafka.producer.send instead
- Mongoose migrated to v7 which has breaking changes see [here](https://mongoosejs.com/docs/7.x/docs/migrating_to_7.html)
- KafkaJS version is specified to 2.x.x. Additional information about breaking changes when migrating to KafkaJS 2.x.x can be found at https://kafka.js.org/docs/migration-guide-v2.0.0
