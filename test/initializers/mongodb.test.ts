const mock = require('mock-require');
import * as sinon from 'sinon';
import 'should';

const sandbox = sinon.createSandbox();

describe('Test mongodb connection', function() {
  const config = {
    mongodb: {
      url: 'mongodb://localhost'
    }
  };
  let connectionStub: sinon.SinonSpy;
  let onStub: sinon.SinonSpy;
  let getMongoDB;

  before(async function() {
    onStub = sandbox.stub();
    connectionStub = sandbox.stub().returns({
      on: onStub
    });
    mock('mongoose', { connect: () => {}, connection: connectionStub });
    ({ default: getMongoDB } = await import('../../src/initializers/mongodb'));
  });

  after(function() {
    sandbox.restore();
    mock.stopAll();
  });

  it('should connect to mongodb', () => {
    getMongoDB(config);
    connectionStub.calledOnce.should.be.true;
  });

  it('should not connect to mongodb with no config', () => {
    getMongoDB({});
    connectionStub.called.should.be.false;
  });

  it('should not connect again to mongodb, if already connected', () => {
    getMongoDB(config);
    getMongoDB(config);
    connectionStub.calledOnce.should.be.true;
  });
});
