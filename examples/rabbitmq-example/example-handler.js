const BaseHandler = require('./base-handler');

class ExampleHandler extends BaseHandler {
  async handle(message) {
    console.log(message);
  }
}

module.exports = ExampleHandler;
