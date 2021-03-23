const { getLogger } = require('../../build');

const logger = getLogger('log');

module.exports = {
  testMe: async arg => {
    logger.info('A log in a service', arg);
    return 'foo';
  }
};
