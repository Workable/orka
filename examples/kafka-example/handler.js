const { BaseKafkaHandler, getKafka } = require('../../build');
const config = require('./config');
const axios = require('axios');

module.exports = class KafkaHandler extends BaseKafkaHandler {
  handle(message) {
    console.log('key', message.key);
    console.log('headers', message.headers);
    console.log('message.value', message.value);
    // console.log('message', message);
    if (message.headers['x-depth'] >= 5) return;
    this.get('write');
  }

  async get(path) {
    const response = await axios.get(`http://localhost:${config.port}/${path}`);
    return response.data;
  }
};

getKafka().createTopics([
  { topic: 'foo', numPartitions: 10, replicationFactor: 1 },
  { topic: 'bar', numPartitions: 10, replicationFactor: 1 },
  { topic: 'test', numPartitions: 10, replicationFactor: 1 }
]);
