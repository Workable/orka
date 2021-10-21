import * as sinon from 'sinon';
import * as axios from 'axios';

import * as interceptor from '../../../src/middlewares/interceptors/axios-error-interceptor';

const sandbox = sinon.createSandbox();
let useStub: sinon.SinonStub;

describe('axios error interceptor', () => {
  beforeEach(() => {
    useStub = sandbox.stub();
    axios.default.interceptors.response = {
      use: useStub,
      eject: sandbox.stub()
    }
  });

  afterEach(() => {
    sandbox.restore();
  })
  
  describe('axios error interceptor', () => {
    it('adds interceptor', () => {
      interceptor.default();
      useStub.called.should.be.true();
    });
  });
});
