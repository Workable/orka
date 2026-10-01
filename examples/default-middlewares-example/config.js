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
    allowedOrigins: ['localhost:3220', 'lvh.me', '*.lvh.me'],
  },
  riviere: {
    bodyKeysRegex: '.*'
  },
  visitor: {
    setCookie: true,
    cookie: 'wmc',
    maxAge: '7d',
    variant: 'v1',
    secure: true,
    forwarded_headers: ['user-agent', 'x-request-id', 'referer', 'origin'],
    waitForAttribution: false,
  },
  port: 3220
};
