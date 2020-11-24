const { getLogger } = require('../../build');

const logger = getLogger('log');

module.exports = {
  testMe: async () => {
    logger.info('A log in a service');
    return 'foo';
  }
};
