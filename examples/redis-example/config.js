module.exports = {
  nodeEnv: 'demo',
  port: 3210,

  redis: {
    url: 'redis://localhost:6379/',
    options: {
      /*tls: {
        ca: ['ca'],
        cert: 'cert',
        key: 'key'
      }*/
    }
  }
};
