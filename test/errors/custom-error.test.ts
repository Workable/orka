import { describe, it, before, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { CustomError } from '../../src/errors/custom-error';

describe('custom-error', function() {
  afterEach(function() {
    mock.restoreAll();
  });

  it('tests custom error handler', async function() {
    const errorSpy = mock.method(Error, 'captureStackTrace');
    const error = new CustomError('This is a test');
    assert.strictEqual(error.message, 'This is a test');
    assert.strictEqual(error.name, 'CustomError');
    assert.ok(error.stack);
    assert.strictEqual(errorSpy.mock.callCount(), 1);
  });
});
