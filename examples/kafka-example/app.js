const { orka, getKafka } = require('../../build');

const w = orka({
  beforeMiddleware: () => [
    async (ctx, next) => {
      ctx.body = 'default body';
      await next();
    }
  ],
  diamorphosis: { configFolder: __dirname },
  routesPath: __dirname + '/routes.js',
  logoPath: __dirname + '/logo.txt',
  beforeStart: async () => {
    const config = require('./config');

    if (config.nodeEnv != 'test') {
      const topic = config.kafka.consumer.topics.name;
      // Will copy offsets from oldGroupId to the new one
      await getKafka().renameGroupId([{ groupId: config.kafka.groupId, topic, oldGroupId: config.kafka.oldGroupId }]);

      const KafkaHandler = require('./handler');
      new KafkaHandler(getKafka(), { topic, fromBeginning: true });
    }
    console.log(`Going to start env: ${config.nodeEnv}`);
  }
});

if (!module.parent) {
  w.start();
}

module.exports = w;
