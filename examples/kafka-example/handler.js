const { BaseKafkaHandler } = require('../../build');

module.exports = class KafkaHandler extends BaseKafkaHandler {
  handle(message) {
    console.log(message.headers);
    console.log(message.value);
    console.log(message);
  }
};
