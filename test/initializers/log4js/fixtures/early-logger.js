const log4js = require('../../../../src/initializers/log4js');
const logger = log4js.getLogger('app');
log4js.default({
  log: { json: true, console: false, level: 'info', categories: {} },
  honeybadger: {},
  requestContext: { logKeys: [] }
});
logger.info('after configure');
