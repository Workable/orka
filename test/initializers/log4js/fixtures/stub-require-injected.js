// Replaces src/require-injected so that requiring `failing` throws, like a failed codependency version check.
const Module = require('module');

module.exports = failing => {
  const file = require.resolve('../../../../src/require-injected');
  const stub = new Module(file);
  stub.filename = file;
  stub.loaded = true;
  stub.exports = {
    __esModule: true,
    default: name => {
      if (name === failing) throw new Error(`Version check of module "${name}" failed`);
      return require(name);
    }
  };
  require.cache[file] = stub;
};
