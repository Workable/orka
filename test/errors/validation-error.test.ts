import 'should';
import * as sinon from 'sinon';
import { ValidationError } from '../../src/errors/validation-error';

const sandbox = sinon.createSandbox();

describe('validation-error', function() {
  before(function() {
    sandbox.restore();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('tests validation error, exposed true', async function() {
    const errorSpy = sandbox.spy(Error, 'captureStackTrace');
    const error = new ValidationError({ message: 'This is a test' }, 500);
    error.message.should.equal(JSON.stringify({ message: 'This is a test' }));
    error.name.should.equal('ValidationError');
    error.stack.should.be.ok();
    error.status.should.be.equal(500);
    error.exposedMsg.should.be.eql({ message: 'This is a test' });
    errorSpy.calledOnce.should.equal(true);
  });
});
