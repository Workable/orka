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
  post: async (path, body) => {
    const response = await axios.post(`http://localhost:${config.port}/${path}`, body, {
      headers: { 'cf-ray': '123', 'x-request-id': '123' }
    });
    return response.data;
  },
  get: async path => {
    const response = await axios.get(`http://localhost:${config.port}/${path}`);
    return response.data;
  }
};
