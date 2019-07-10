const { getKafka, getLogger } = require('../../build');
const config = require('./config');
const KafkaHandler = require('./handler');
const input = require('./input');

const kafka = getKafka();

module.exports = {
  get: {
    '/init': async (ctx, next) => {
      const topic = config.kafka.consumer.topics.name;
      const batchSize = config.kafka.consumer.topics.batchSize;
      new KafkaHandler(kafka, { topic, logger: getLogger('test'), batchSize });
    },
    '/write': async (ctx, next) => {
      const topic = config.kafka.consumer.topics.test;
      await kafka.send(topic, JSON.stringify(input));
    }
  }
};
