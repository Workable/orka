const { Kafka, getLogger } = require('../../build');
const config = require('./config');
const KafkaHandler = require('./handler');
const input = require('./input');

const options = {
  key: config.kafka.certificates.key,
  cert: config.kafka.certificates.cert,
  ca: config.kafka.certificates.ca,
  groupId: config.kafka.consumer.groupId,
  brokers: config.kafka.brokers
};
const kafka = new Kafka(options);

module.exports = {
  get: {
    '/init': async (ctx, next) => {
      await kafka.connect();
      const topic = config.kafka.consumer.topics.test;
      new KafkaHandler(kafka, { topic, logger: getLogger('test') });
    },
    '/write': async (ctx, next) => {
      const topic = config.kafka.consumer.topics.test;
      await kafka.send(topic, JSON.stringify(input));
    }
  }
};
