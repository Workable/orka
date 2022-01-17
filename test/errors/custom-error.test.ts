import 'should';
import * as sinon from 'sinon';
import { CustomError } from '../../src/errors/custom-error';

const sandbox = sinon.createSandbox();

describe('custom-error', function() {
  before(function() {
    sandbox.restore();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('tests custom error handler', async function() {
    const errorSpy = sandbox.spy(Error, 'captureStackTrace');
    const error = new CustomError('This is a test');
    error.message.should.equal('This is a test');
    error.name.should.equal('CustomError');
    error.stack.should.be.ok();
    errorSpy.calledOnce.should.equal(true);
  });
});
