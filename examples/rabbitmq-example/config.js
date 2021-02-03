module.exports = {
  nodeEnv: 'demo',
  app: {
    name: 'foo'
  },
  queue: {
    prefetch: 100,
    url: 'amqp://localhost',
    frameMax: 0x1000,
    maxRetries: 0,
    retryDelay: 1000,
    connectDelay: 5000
  }
};
