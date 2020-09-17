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
  }
};
