import * as _axios from 'axios';
import snapshot = require('snap-shot-it');
import * as util from 'util';
import { AxiosError } from '../../src/errors/axios-error';
import * as sinon from 'sinon';

const sandbox = sinon.createSandbox();

describe('axios error', () => {

  before(function() {
    sandbox.restore();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('AxiosError', () => {
    snapshot(new AxiosError({
      config: {
        method: 'GET',
        url: '/url/',
      },
      isAxiosError: true,
      response: {
        status: 500,
        statusText: 'internal server error',
      },
    } as any));
  });

  it('inspect', () => {
    (new AxiosError({} as any)[util.inspect.custom]().AxiosError).should.be.ok();
  });
});
