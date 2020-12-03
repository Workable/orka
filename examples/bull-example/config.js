module.exports = {
  nodeEnv: 'demo',
  app: {
    name: 'bull-example'
  },
  log: {
    json: false
  },
  prometheus: {
    enabled: true
  },
  bull: {
    redis: {
      url: 'redis://localhost:6379/',
      tls: {
        ca: '',
        cert: '',
        key: ''
      }
    },
    queue: {
      options: {
        removeOnComplete: true
      },
      queues: [
        {
          name: 'queue_one',
          options: {}
        },
        {
          name: 'queue_two',
          options: { delay: 15000 }
        }
      ]
    }
  }
};
