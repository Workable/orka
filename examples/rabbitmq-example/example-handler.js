const BaseHandler = require('./base-handler');
const { getRabbit, getLogger } = require('../../build');

const rabbit = getRabbit();

const logger = getLogger('test')

class ExampleHandler extends BaseHandler {
   async handle(message) {
    console.log(message);
    
  };
};


module.exports = ExampleHandler;
