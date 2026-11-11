// Mirrors an app that takes a logger and registers an uncaughtException handler before calling orka().
require('./stub-require-injected')('newrelic');
const { orka, getLogger } = require('../../../../src');

const logger = getLogger('app');
process.on('uncaughtException', (reason, origin) => {
  logger.error(`Uncaught Exception at Origin: ${origin} reason: ${reason}`, { origin, reason });
  process.exit(1);
});

orka({ diamorphosis: { configFolder: './examples/simple-example' } });
