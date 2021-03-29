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
    bodyKeysRegex: '.*'
  }
};
