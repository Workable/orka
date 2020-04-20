const { getKafka, getLogger } = require('../../build');
const KafkaHandler = require('./handler');
const input = require('./input');

module.exports = {
  get: {
    '/init': async (ctx, next) => {
      const config = require('./config');
      const kafka = getKafka();
      const topic = config.kafka.consumer.topics.name;
      const batchSize = config.kafka.consumer.topics.batchSize;
      new KafkaHandler(kafka, { topic, logger: getLogger('test'), batchSize });
    },
    '/write': async (ctx, next) => {
      const config = require('./config');
      const kafka = getKafka();
      const topic = config.kafka.producer.topics.test;
      await kafka.send(topic, JSON.stringify(input), null, null, [
        { customHeaderKeyOne: 'customHeaderValueOne' },
        { customHeaderKeyTwo: 'customHeaderValueTwo' }
      ]);
    }
  }
};
