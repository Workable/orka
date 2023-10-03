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
        enabled: true
      }
    },
    outbound: {
      request: {
        enabled: true
      }
    }
  },
  requestContext: {
    logKeys: ['requestId', 'query', 'afterMiddleware', 'propagatedHeaders']
  },
  port: 2121
};
