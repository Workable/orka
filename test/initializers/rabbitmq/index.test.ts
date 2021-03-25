const mock = require('mock-require');
import * as sinon from 'sinon';
import 'should';

const sandbox = sinon.createSandbox();

describe('Test rabbitmq connection', function () {
  let config;
  const orkaOptions = {
    appName: 'test'
  };
  let stub: sinon.SinonSpy;
  let onStub: sinon.SinonSpy;
  let getRabbit;

  beforeEach(async function () {
    config = {
      queue: {
        prefetch: 100,
        url: 'amqp://localhost',
        frameMax: 0x1000,
        maxRetries: 0,
        retryDelay: 1000,
        connectDelay: 5000
      }
    };
    onStub = sandbox.stub();
    stub = sandbox.stub().returns({
      on: onStub
    });
    mock('rabbit-queue', {
      Rabbit: stub,
      BaseQueueHandler: { prototype: { tryHandle: { call: sandbox.stub() } } }
    });
    delete require.cache[require.resolve('../../../src/initializers/rabbitmq')];
    ({ default: getRabbit } = await import('../../../src/initializers/rabbitmq'));
  });

  afterEach(function () {
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
    getRabbit(config, orkaOptions);
    getRabbit(config, orkaOptions);
    stub.args.should.eql([
      [
        'amqp://localhost?frameMax=4096',
        {
          prefetch: 100,
          prefix: 'test',
          scheduledPublish: true,
          socketOptions: {
            servername: 'localhost'
          }
        }
      ]
    ]);
  });

  it('should ovewrite options from config', () => {
    config.queue.options = {};
    config.queue.options.scheduledPublish = false;
    const rabbit = getRabbit(config, orkaOptions);
    stub.args.should.eql([
      [
        'amqp://localhost?frameMax=4096',
        {
          prefetch: 100,
          prefix: 'test',
          scheduledPublish: false,
          socketOptions: {
            servername: 'localhost'
          }
        }
      ]
    ]);
  });
});
