module.exports = {
  nodeEnv: 'demo',
  orka: {
    appName: 'foo'
  },
  kafka: {
    groupId: 'orka.example.consumer',
    clientId: 'orka.example.producer',
    brokers: ['localhost:9092'],
    certificates: {
      ca: '',
      cert: '',
      key: ''
    },
    debug: true,
    consumer: {
      topics: {
        name: 'orka.example.consume',
        batchSize: 10
      }
    },
    producer: {
      topics: {
        test: 'orka.example.produce'
      }
    }
  }
};
