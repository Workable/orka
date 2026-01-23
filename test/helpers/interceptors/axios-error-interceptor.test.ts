import axios from 'axios';
import * as nock from 'nock';
import * as snapshot from 'snap-shot-it';
import * as interceptor from '../../../src/helpers/interceptors/axios-error-interceptor';

describe('axios error interceptor', () => {
  it('should add context in error object for failed get request', async function () {
    interceptor.default();
    nock('http://test.com').get('/test').reply(404);
    try {
      await axios.get('http://test.com/test', { headers: { key: 'key' } });
    } catch (e) {
      e.message.should.equal('Error while requesting get: http://test.com/test, responded with 404, Not Found');
      e.context.method.should.equal('get');
      snapshot(JSON.parse(JSON.stringify(e)));
    }

    nock.isDone();
  });
});
