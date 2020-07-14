import * as mock from 'mock-require';
import * as sinon from 'sinon';
import 'should';
import clouddebugger from '../../src/initializers/clouddebugger';

const sandbox = sinon.createSandbox();

describe('Test cloud debugger', function() {
  const debugagent: { start?: sinon.SinonSpy } = {};

  beforeEach(function() {
    debugagent.start = sandbox.stub();
    mock('@google-cloud/debug-agent', debugagent);
  });

  afterEach(function() {
    sandbox.restore();
    mock.stopAll();
  });

  it('should initialize cloud debugger', async () => {
    await clouddebugger({ appName: 'test-app' });
    debugagent.start.called.should.be.true();
  });

  it('should use npm_package_version', async () => {
    await clouddebugger({ appName: 'test-app' });
    debugagent.start.args[0][0].should.eql({
      serviceContext: { service: 'test-app', version: '0.31.3' },
      allowExpressions: true
    });
  });
});
