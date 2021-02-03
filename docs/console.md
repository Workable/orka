---
layout: default
title: Console
nav_order: 8
---

# Console

Having a good console to debug or test your code is always useful.
[node-nc](https://www.npmjs.com/package/node-nc) is a very useful package to do just that.
Similarly to rails console it globalizes your files and packages to be easily used.

To use seamlessly with orka a simple nc.js file could be:

```js
process.env.NODE_ENV = 'console';
const { orka, getRabbit } = require('@workablehr/orka');

globla.orka = orka({
  // your custom configuration would go here
})
  .initTasks()
  .initMiddleware();

global.getRabbit = getRabbit;
```

## Checking config that it is reading env correctly

```sh
npx node-nc
> npx: installed 13 in 2.556s
> @workablehr/orka> config
> {
>   nodeEnv: 'demo',
>   log: { json: true },
>   app: { name: 'foo' },
>   cors: { publicPrefixes: [ '/api/allowAll' ] },
>   riviere: { bodyKeysRegex: '.*' }
> }
```

## Checking that a route is matched correctly

```sh
npx node-nc
> orka.defaultRouter.matching('/testGet', 'GET')
> {
>   ctx: {
>     path: '/testGet',
>     method: 'GET',
>     params: {},
>     _matchedRoute: '/testGet'
>   },
>   middlewares: [ [AsyncFunction], [AsyncFunction] ]
> }
```

## Publishing messages to RabbitMQ

```sh
npx node-nc
> getRabbit.publish('queue', {data:{}}, {correlationId:'test'})
```
