module.exports = {
  nodeEnv: 'demo',
  log: {
    json: true
  },
  app: {
    name: 'foo'
  },
  cors: {
    publicPrefixes: ['/api/allowAll'],
    allowedOrigins: ['localhost:3000', 'lvh.me'],
  },
  riviere: {
    bodyKeysRegex: '.*'
  }
};
