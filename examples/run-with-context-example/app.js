const { orka, runWithContext } = require('../../build');
const { testMe } = require('./service');

const w = orka({
  diamorphosis: { configFolder: './examples/run-with-context-example' }
});

const testFunction = () => {
  return runWithContext(new Map([['requestId', 'trace-id']]), testMe, 'argument');
};

if (!module.parent) {
  w.initTasks().then(testFunction);
}

module.exports = {
  default: w,
  testFunction
};
