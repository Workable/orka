module.exports = {
  nodeEnv: 'demo',
  orka: {
    appName: 'foo'
  },
  kafka: {
    brokers: ['localhost:9092'],
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
