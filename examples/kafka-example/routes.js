const { getKafka, getLogger } = require('../../build');
const KafkaHandler = require('./handler');
const input = require('./input');
const {
  middlewares: { health }
} = require('../../build');

module.exports = {
  get: {
    health: health,
    '/init': async (ctx, next) => {
      const config = require('./config');
      const kafka = getKafka();
      const topic = config.kafka.consumer.topics.name;
      const groupId = config.kafka.consumer.topics.groupId;
      new KafkaHandler(kafka, { topic, logger: getLogger('test'), fromBeginning: true, consumerOptions: { groupId } });
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
