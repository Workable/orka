const { getLogger } = require('../../build');
const axios = require('axios');
const config = require('./config');

const logger = getLogger('log');

module.exports = {
  testMe: async () => {
    logger.info('A log in a service');
    return 'foo';
  },
  postFoo: async foo => {
    await axios.post('http://foo.com/', { foo });
  },
  get: async path => {
    const response = await axios.get(`http://localhost:${config.port}/${path}`);
    return response.data;
  }
};
