const log4js = require('../../../../src/initializers/log4js');
const logger = log4js.getLogger('app');
logger.debug('before configure');
log4js.default({
  log: { json: true, console: false, level: 'info', categories: {} },
  honeybadger: {},
  requestContext: { logKeys: [] }
});
logger.debug('debug after configure');
logger.info('after configure');
