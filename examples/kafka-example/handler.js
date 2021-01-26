const { BaseKafkaHandler, getKafka } = require('../../build');

module.exports = class KafkaHandler extends BaseKafkaHandler {
  handle(message) {
    console.log(message.headers);
    console.log(message.value);
    console.log(message);
  }
};

getKafka().createTopics([
  { topic: 'foo', numPartitions: 10, replicationFactor: 1 },
  { topic: 'bar', numPartitions: 10, replicationFactor: 1 },
  { topic: 'test', numPartitions: 10, replicationFactor: 1 }
]);
