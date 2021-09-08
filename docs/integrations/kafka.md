---
layout: default
title: Kafka
parent: Integrations
nav_order: 1
---

# Kafka
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}



Orka is using [kafkaJS](https://kafka.js.org/) under the hood. It exposes most of the underlying configuration to the user.

## Installation

Kafkajs is an optional dependency. In order to enable it install the dependency first:

```sh
npm i kafkajs
```

and then add some brokers and authentication keys in your environment.

### Configuration


```js
// config/config.js
module.exports = {
"kafka": {
    "brokers": [], // An array of the brokers url
    "groupId": "", // Default groupId to be used. Can be used by at most one consumer. All following consumers must overwrite it
    "clientId": "", // An name identifying the application
    "ssl": true,
    "log": {
      "level": "info",
      "errorToWarn": [
        "The group is rebalancing, re-joining",
        "Response Heartbeat(key: 12, version: 3)"
      ]
    },
    "certificates": { // Should be given if the authentication is through certificates
      "key": "",
      "cert": "",
      "ca": [],
      "rejectUnauthorized": false
    },
    "sasl": { // Should be given if the authentication is through sasl
      "mechanism": "",
      "username": "",
      "password": ""
    },
    "producer": { // Can be given if the producer is using a different kafka broker than the consumer. Might be useful for migrating brokers.
      "brokers": [],
      "ssl": true,
      "certificates": {
        "key": "",
        "cert": "",
        "ca": [],
        "rejectUnauthorized": false
      },
      "sasl": {
        "mechanism": "",
        "username": "",
        "password": ""
      }
    }
  }
}
```

### Consuming messages
You can choose if you'll consume messages one by one (Kafka never consumes messages one by one, it is just a convenient way provided by KafkaJS) or in batches.

Depending on what you need to do you should choose to use either `BaseKafkaHandler` or `BaseKafkaBatchHandler`. Have a look to the following examples:
#### app/services/kafka/handler.js
```js
// app/services/kafka/handler.js
const { BaseKafkaHandler, getKafka } = require('../../build');

module.exports = class KafkaHandler extends BaseKafkaHandler {
  handle(message) {
    console.log(message.headers);
    console.log(message.value);
    console.log(message);
  }
};
```

#### app/services/kafka/batch-handler.js
```js
// app/services/kafka/batch-handler.js
const { BaseKafkaBatchHandler, getKafka } = require('../../build');

module.exports = class KafkaHandler extends BaseKafkaBatchHandler {

  handleBatch(batch) {
    console.log(`Received batch with ${batch.messages.length} messages from topic ${batch.topic}`);
  }
};
```

#### RequestContext
When you use `BaseKafkaHandler`, orka by default runs the message handling inside `runWithContext` function and appends the `key` of the message in the context with name `correlationId`.

That means that every log of your consumer will contain the `key` of the message and that you can also add any variable you want in the context.

Example:
```js
const { BaseKafkaHandler, getRequestContext } = require('@workablehr/orka');

async function handler(val) {
  logger.info('Var: ', getRequestContext().get('test-variable'))
}

module.exports = class KafkaHandler extends BaseKafkaHandler {
  async handle(message) {
    getRequestContext().set('test-variable', 'orka');
    logger.info('Consuming message');
    await handler(message.value);
  }
};

// In the above example if we receive a message with key=123, it will log:
// [123] Consuming message
// [123] Var: orka
```

Note: In the above example only `correlationId` is logged by default. If you want to have the `test-variable` automatically logged on each log entry, you need to include it on your configuration `requestContext.logKeys`. For more, see the [Log Tracer](https://workable.github.io/orka/request-context.html#log-tracer) docs.

#### app.js
```js
//app.js
const { orka, getKafka } = require('@workablehr/orka');

orka({
  beforeStart: config => {
    const KafkaHandler = require('./app.services/kafka/handler');
    new KafkaHandler(getKafka(), {
      topic,
      fromBeginning: true,
      consumerOptions: { groupId: 'newGroupID' }, // anything kafkajs  .consumer() accepts
      runOptions: {}, // anything consumer.run() accepts
      jsonParseValue: true, // value is Buffer otherwise
      stringifyHeaders: true // headers are Buffer's otherwise,
      onConsumerCreated: (c: Consumer) => any // it is called when the consumer is created
    });
  }
}).start();
```

### Producing messages

```js
const kafka = getKafka();

await kafka.producer.send({
    topic: 'topic-name',
    messages: [
        { key: 'key1', value: 'hello world',  headers: { 'system-id': 'my-system' } },
        { key: 'key2', value: 'hey hey!' }
    ],
});
```

See [kafkaJS producer](https://kafka.js.org/docs/producing) for more.

### Creating topics programmatically

You can easily create topics programmatically with:

```js
await getKafka().createTopics([
  { topic: 'foo', numPartitions: 10, replicationFactor: 1 },
  { topic: 'bar', numPartitions: 10, replicationFactor: 1 },
  { topic: 'test', numPartitions: 10, replicationFactor: 1 }
]);
```

### Renaming groupIds programmatically

You can copy offsets from older groupIds to new ones with:
```js
await getKafka().renameGroupId([
  { groupId: config.kafka.groupId, topic, oldGroupId: config.kafka.oldGroupId },
  { groupId: config.kafka.groupId2, topic, oldGroupId: config.kafka.oldGroupId2 },
]);
```

This will create the groupIds specified and will set the offsets that the oldGroupIds had.
If the new groupIds are found with offsets it does nothing.
This does not delete old group ids however.

## Local Kafka Server

You can easily start a local kafka server for development with the below command:

`npm explore @workablehr/orka -- npm run kafka:start`

## Migrating from orka < 2.x.x

If you were using orka before version 2.x.x the integration with kafka has changed.
From using [sinek](https://www.npmjs.com/package/sinek) that was using [node-rdkafka](https://www.npmjs.com/package/node-rdkafka) under the hood to directly using [kafkaJS](https://kafka.js.org/)

Most of the api is backwards compatible. However there is one implication

- kafkaJS does not allow the same groupId to be used by many different consumers that consume from different topics.

So if you used many consumers each one consuming from different topics, you will have to migrate them to new groupId names.
To make this simple orka exposes [Renaming groupIds programmatically](https://workable.github.io/orka/integrations/kafka#renaming-groupids-programmatically)

A simple example:

```js
// app.js
orka({
  beforeStart: () => {
    await getKafka().renameGroupId([
      { groupId: 'newGroupID', topic:'topic', oldGroupId: 'oldGroupId'}
      { groupId: 'newGroupID2', topic:'topic2', oldGroupId: 'oldGroupId'}
    ]);

    const KafkaHandler = require('./app.services/kafka/handler');
    new KafkaHandler(getKafka(), { topic, fromBeginning: true, consumerOptions: { groupId:'newGroupID' } });

    const AnotherKafkaHandler = require('./app.services/kafka/another-handler');
    new AnotherKafkaHandler(getKafka(), { topic, fromBeginning: true, consumerOptions: { groupId:'newGroupID2' } });
  }
}).start();

```

Note that the old group ids won't be deleted automatically.
You also need to specify the new group ids in your consumers while previously you didn't have too.
Once the new group ids are created you can remove the code that copies their offsets from old group ids. This is causing no issues thought as it doesn't do anything if the new group ids are found with offsets set.

If you are using the renameGroupIds (before creating your consumers) your consumers will continue reading messages from the offset specified from the old groupId regardless if you set the fromBeginning configuration. FromBeginning configuration will be used if the groupId, topic is not found in kafka.
