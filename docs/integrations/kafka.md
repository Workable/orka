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
      "level": "info"
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
      stringifyHeaders: true // headers are Buffer's otherwise
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
