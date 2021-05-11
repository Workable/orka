const mock = require('mock-require');
import * as sinon from 'sinon';
import 'should';
import * as RabbitType from 'rabbit-queue';
import { getRequestContext } from '../../../src/builder';
import { logMetrics } from '../../../src/helpers';

const sandbox = sinon.createSandbox();

describe('Test rabbitmq connection', function () {
  let config;
  const orkaOptions = {
    appName: 'test'
  };
  let stub: sinon.SinonSpy;
  let onStub: sinon.SinonSpy;
  let getRabbit;
  let getConnection: () => RabbitType.Rabbit;

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
      BaseQueueHandler: class BaseQueueHandler {
        getCorrelationId() {
          return 'corId';
        }
        handle() {}
        tryHandle() {
          this.handle();
        }
        handleError() {}
      }
    });
    delete require.cache[require.resolve('../../../src/initializers/rabbitmq')];
    ({ default: getRabbit, getRabbit: getConnection } = await import('../../../src/initializers/rabbitmq'));
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

  describe('BaseQueueHandler enhanced logic', function () {
    let queueHandler;
    let stub;
    beforeEach(async function () {
      getRabbit(config, orkaOptions);
      const rabbit = getConnection();
      const { BaseQueueHandler } = await import('rabbit-queue');
      stub = sandbox.stub();
      class TestHandler extends BaseQueueHandler {
        handle() {
          const ctx = getRequestContext();
          stub(ctx);
          return;
        }
      }
      queueHandler = new TestHandler('test', rabbit, {});
    });

    it('runsTryHandle in context', function () {
      queueHandler.tryHandle();
      stub.args.should.eql([[new Map().set('correlationId', 'corId')]]);
    });

    it('getTime as a bigint from logMetrics', function () {
      sandbox.stub(logMetrics, 'start').returns(1n);
      queueHandler.getTime().should.eql(1n);
    });

    it('logTime from logMetrics', function () {
      const stub = sandbox.stub(logMetrics, 'end');
      queueHandler.logTime('args', 1);
      stub.args.should.eql([['args', undefined, 'queue', 1]]);
    });

    it('handleError adds compatible to HB keys', function () {
      const err: any = new Error('test');
      queueHandler.queueName = 'test';
      queueHandler.handleError(err, {});
      err.action.should.eql('test');
      err.component.should.eql('rabbit-queue');
      err.context.should.eql({ correlationId: 'corId' });
    });
  });
});
