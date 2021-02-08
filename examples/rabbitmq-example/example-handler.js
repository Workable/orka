const { BaseQueueHandler } = require('rabbit-queue');
const { getRabbit } = require('../../build');

class ExampleHandler extends BaseQueueHandler {
  constructor(queueName, logEnabled = true) {
    const config = require('./config');
    super(queueName, getRabbit(), {
      logEnabled,
      retries: config.queue.maxRetries,
      retryDelay: config.queue.retryDelay
    });
  }

  async handle(message) {
    console.log(message);
  }
}

module.exports = ExampleHandler;
