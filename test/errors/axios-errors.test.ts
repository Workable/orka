import { describe, it, before, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import * as util from 'util';
import { AxiosError } from '../../src/errors/axios-error';

describe('axios error', () => {

  before(function() {
    mock.restoreAll();
  });

  afterEach(function() {
    mock.restoreAll();
  });

  it('AxiosError', () => {
    const error = new AxiosError({
      config: {
        method: 'GET',
      url: '/url/',
    },
    isAxiosError: true,
    response: {
      status: 500,
      statusText: 'internal server error',
    },
  } as any);

  assert.ok(error);
    assert.ok(error.config);
    assert.strictEqual(error.config.method, 'GET');
    assert.strictEqual(error.config.url, '/url/');
    assert.strictEqual(error.response?.status, 500);
    assert.strictEqual(error.response?.statusText, 'internal server error');
  });

  it('inspect', () => {
    const error = new AxiosError({} as any);
    const inspected = error[util.inspect.custom]();
    assert.ok(inspected.AxiosError);
  });
});
