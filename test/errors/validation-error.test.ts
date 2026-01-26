import { describe, it, before, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { ValidationError } from '../../src/errors/validation-error';

describe('validation-error', function() {
  afterEach(function() {
    mock.restoreAll();
  });

  it('tests validation error, exposed true', async function() {
    const errorSpy = mock.method(Error, 'captureStackTrace');
    const error = new ValidationError({ message: 'This is a test' }, 500);
    assert.strictEqual(error.message, JSON.stringify({ message: 'This is a test' }));
    assert.strictEqual(error.name, 'ValidationError');
    assert.ok(error.stack);
    assert.strictEqual(error.status, 500);
    assert.deepStrictEqual(error.exposedMsg, { message: 'This is a test' });
    assert.strictEqual(errorSpy.mock.callCount(), 1);
  });
});
