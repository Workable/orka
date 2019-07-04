const mock = require('mock-require');
import * as sinon from 'sinon';
import 'should';

const sandbox = sinon.createSandbox();

describe('Test rabbitmq connection', function() {
  const config = {
    queue: {
      prefetch: 100,
      url: 'amqp://localhost',
      frameMax: 0x1000,
      maxRetries: 0,
      retryDelay: 1000,
      connectDelay: 5000
    }
  };
  const orkaOptions = {
    appName: 'test'
  };
  let stub: sinon.SinonSpy;
  let onStub: sinon.SinonSpy;
  let getRabbit;

  beforeEach(async function() {
    onStub = sandbox.stub();
    stub = sandbox.stub().returns({
      on: onStub
    });
    mock('rabbit-queue', { Rabbit: stub });
    delete require.cache[require.resolve('../../../src/initializers/rabbitmq')];
    ({ default: getRabbit } = await import('../../../src/initializers/rabbitmq'));
  });

  afterEach(function() {
    sandbox.restore();
    mock.stopAll();
  });

  it('should connect to rabbitmq', () => {
    const rabbit = getRabbit(config, orkaOptions);
    stub.calledOnce.should.be.true();
  });

  it('should not connect to rabbitmq, no config', () => {
    const rabbit = getRabbit({}, orkaOptions);
    stub.called.should.be.false();
  });

  it('should not connect to rabbitmq, already connected', () => {
    const rabbit = getRabbit(config, orkaOptions);
    const rabbit_second = getRabbit(config, orkaOptions);
    stub.calledOnce.should.be.true();
  });
});
