module.exports = {
  nodeEnv: 'demo',
  log: {
    json: false
  },
  app: {
    name: 'foo'
  },
  cors: {
    publicPrefixes: ['/api/allowAll']
  },
  riviere: {
    bodyKeysRegex: '.*',
    inbound: {
      request: {
        enabled: false
      }
    },
    outbound: {
      request: {
        enabled: false
      }
    }
  },
  requestContext: {
    logKeys: ['requestId', 'query', 'afterMiddleware']
  },
  port: 2121
};
