module.exports = {
  nodeEnv: 'diamorphosis_env',
  kafka: {
    brokers: ['confluent'],
    certificates: {
      ca: 'ca',
      key: 'key',
      cert: 'cert'
    },
    producer: {
      topics: {
        topic1: 'topic1'
      }
    }
  }
};
