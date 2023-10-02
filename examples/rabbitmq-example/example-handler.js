const { BaseQueueHandler } = require('rabbit-queue');
const { getRabbit, getLogger } = require('../../build');
const axios = require('axios');
const config = require('./config');

const logger = getLogger('example-handler');
class ExampleHandler extends BaseQueueHandler {
  constructor(queueName, logEnabled = true) {
    const config = require('./config');
    super(queueName, getRabbit(), {
      logEnabled,
      retries: config.queue.maxRetries,
      retryDelay: config.queue.retryDelay
    });
  }

  async get(path) {
    const response = await axios.get(`http://localhost:${config.port}/${path}`);
    return response.data;
  }

  async handle(message) {
    logger.info('handling message');
    if (message.msg.properties.headers['x-depth'] >= 5) return message.msg.properties.headers;
    return await this.get('init');
  }
}

module.exports = ExampleHandler;
