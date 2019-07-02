module.exports = {
  nodeEnv: 'demo',
  orka: {
    appName: 'foo'
  }, 
  queue: {
    prefetch: 100,
    url: process.env.CLOUDAMQP_URL || 'amqp://localhost',
    frameMax: 0x1000,
    maxRetries: 0,
    retryDelay: 1000,
    connectDelay: 5000,
    maxPriority: 10,
    replyQueues: ['example']
  },
};
