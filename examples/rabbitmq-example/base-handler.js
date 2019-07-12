/* tslint:disable:no-empty */
const { BaseQueueHandler } = require('rabbit-queue');
const { getRabbit } = require('../../build');
const config = require('./config');

class BaseHandler extends BaseQueueHandler {
  constructor(queueName, logEnabled = true) {
    super(queueName, getRabbit(), {
      logEnabled,
      retries: config.queue.maxRetries,
      retryDelay: config.queue.retryDelay
    });
  }

  handle(data) {}
  afterDlq(data) {}
}

module.exports = BaseHandler;
