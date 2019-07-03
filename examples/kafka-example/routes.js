const { getKafka, getLogger } = require('../../build');
const config = require('./config');
const KafkaHandler = require('./handler');
const input = require('./input');

const kafka = getKafka();

module.exports = {
  get: {
    '/init': async (ctx, next) => {
      const topic = config.kafka.consumer.topics.test;
      new KafkaHandler(kafka, { topic, logger: getLogger('test') });
    },
    '/write': async (ctx, next) => {
      const topic = config.kafka.consumer.topics.test;
      await kafka.send(topic, JSON.stringify(input));
    }
  }
};
