import { describe, it } from 'node:test';
import assert from 'node:assert';
import axios from 'axios';
import nock from 'nock';
import * as interceptor from '../../../src/helpers/interceptors/axios-error-interceptor';

describe('axios error interceptor', () => {
  it('should add context in error object for failed get request', async function () {
    interceptor.default();
    nock('http://test.com').get('/test').reply(404);
    try {
      await axios.get('http://test.com/test', { headers: { key: 'key' } });
      assert.fail('Should have thrown an error');
    } catch (e: any) {
      assert.strictEqual(e.message, 'Error while requesting get: http://test.com/test, responded with 404, null');
      assert.strictEqual(e.context.method, 'get');
      assert.ok(e.context);
    }

    assert.ok(nock.isDone());
  });
});
