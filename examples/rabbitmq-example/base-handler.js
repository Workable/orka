/* tslint:disable:no-empty */
const { BaseQueueHandler } = require('rabbit-queue');
const { getRabbit } = require('../../build');
const config = require('./config');

const rabbit = getRabbit();
class BaseHandler extends BaseQueueHandler {
  constructor(queueName, logEnabled = true) {
    super(queueName, rabbit, {
      logEnabled,
      retries: config.queue.maxRetries,
      retryDelay: config.queue.retryDelay
    });
  }

   handle(data) {}
   afterDlq(data) {}
   handleError(err, msg) {
    err.action = this.queueName;
    err.component = err.component || 'rabbit-queue';
    err.context = err.context || {};
    err.context.correlationId = this.getCorrelationId(msg);
    super.handleError(err, msg);
  }
}

module.exports = BaseHandler;