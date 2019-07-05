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
  let onStub: sinon.SinonSpy;
  let mongodb;
  let connectStub: sinon.SinonSpy;

  beforeEach(async function() {
    onStub = sandbox.stub();
    connectStub = sandbox.stub();
    mock('mongoose', { connect: connectStub, connection: { on: onStub } });
    ({ default: mongodb } = await import('../../src/initializers/mongodb'));
  });

  afterEach(function() {
    sandbox.restore();
    mock.stopAll();
  });

  it('should connect to mongodb', () => {
    mongodb(config);
    onStub.callCount.should.equal(4);
  });

  it('should not connect to mongodb with no config', () => {
    mongodb({});
    connectStub.called.should.be.false();
  });
});
