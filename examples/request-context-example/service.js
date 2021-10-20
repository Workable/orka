const { getLogger } = require('../../build');
const axios = require('axios');

const logger = getLogger('log');

module.exports = {
  testMe: async () => {
    logger.info('A log in a service');
    return 'foo';
  },
  postFoo: async (foo) => {
    await axios.post('http://foo.com/', { foo });
  },
};
