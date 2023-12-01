module.exports = {
  nodeEnv: 'demo',
  app: {
    name: 'foo'
  },
  log: { json: false },
  traceHeaderName: 'x-request-id',
  queue: {
    prefetch: 100,
    url: 'amqp://127.0.0.1',
    frameMax: 0x1000,
    maxRetries: 0,
    retryDelay: 1000,
    connectDelay: 5000
  },
  riviere: {
    inbound: {
      request: {
        enabled: true
      }
    },
    outbound: {
      request: {
        enabled: true
      }
    }
  }
};
