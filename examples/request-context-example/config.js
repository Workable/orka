module.exports = {
  nodeEnv: 'demo',
  log: {
    json: true
  },
  app: {
    name: 'foo'
  },
  cors: {
    publicPrefixes: ['/api/allowAll']
  },
  riviere: {
    bodyKeysRegex: '.*'
  },
  requestContext: {
    logKeys: ['requestId', 'query', 'afterMiddleware']
  },
  port: 2121
};
