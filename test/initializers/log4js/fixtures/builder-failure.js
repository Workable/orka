require('./stub-require-injected')('newrelic');
const builder = require('../../../../src/builder').default;
builder({ diamorphosis: { configFolder: './examples/simple-example' } });
