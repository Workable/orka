module.exports = {
  nodeEnv: 'demo',
  app: {
    name: 'foo',
  },
  bull: {
    redis: {
      url: 'redis://localhost:6379',
      tls: null,
    },
    queues: [
      {
        name: 'testQueue',
        options: { priority: 1 },
      },
    ],
  },
};
