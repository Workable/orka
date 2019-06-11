module.exports = {
  nodeEnv: 'demo',
  orka: {
    appName: 'foo'
  },
  kafka: {
    brokers: [],
    certificates: {
      ca: '',
      cert: '',
      key: ''
    },
    debug: true,
    consumer: {
      groupId: 'dev.orka.consumer',
      topics: {
        test: 'orka.example.consume'
      }
    },
    producer: {
      clientId: 'dev.orka.producer',
      topics: {
        test: 'orka.example.produce'
      }
    }
  }
};
