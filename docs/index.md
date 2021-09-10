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