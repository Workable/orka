module.exports = {
  nodeEnv: 'demo',
  app: {
    name: 'bull-example'
  },
  log: {
    json: false
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
          options: {}
        }
      ]
    }
  }
};
