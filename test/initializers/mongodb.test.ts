import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';

describe('Test mongodb connection', function() {
  const config = {
    mongodb: {
      url: 'mongodb://localhost'
    }
  };
  let onStub: ReturnType<typeof mock.fn>;
  let mongodb: any;
  let connectStub: ReturnType<typeof mock.fn>;

  beforeEach(async function() {
    onStub = mock.fn();
    connectStub = mock.fn();
    delete require.cache[require.resolve('../../src/initializers/mongodb')];
    mock.module('mongoose', {
      namedExports: {
        connect: connectStub,
        connection: { on: onStub }
      }
    });
    ({ default: mongodb } = await import('../../src/initializers/mongodb'));
  });

  afterEach(function() {
    mock.restoreAll();
  });

  it('should connect to mongodb', () => {
    mongodb(config);
    assert.strictEqual(onStub.mock.callCount(), 4);
  });

  it('should not connect to mongodb with no config', () => {
    mongodb({});
    assert.strictEqual(connectStub.mock.callCount(), 0);
  });
});
