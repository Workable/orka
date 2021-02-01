module.exports = {
  nodeEnv: 'demo',
  app: {
    name: 'foo'
  },
  log: {
    json: true
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
    sasl: {
      username: '',
      password: ''
    },
    log: {
      level: 'debug'
    },
    consumer: {
      topics: {
        name: 'orka.example.test',
        batchSize: 10
      }
    },
    producer: {
      topics: {
        test: 'orka.example.test'
      }
    }
  }
};
