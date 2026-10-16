// Builds an orka app, which loads orka-builder and the middlewares it imports.
const builder = require('../../src/builder').default;
builder({ diamorphosis: { configFolder: './examples/simple-example' } });
