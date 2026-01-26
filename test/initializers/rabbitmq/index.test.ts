import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import type * as RabbitType from 'rabbit-queue';
import { getRequestContext } from '../../../src/builder';
import { logMetrics } from '../../../src/helpers';
import { getMockCallArgs } from '../../helpers/assert-helpers';

describe('Test rabbitmq connection', function () {
  let config: any;
  const orkaOptions = {
    appName: 'test'
  };
  let stub: any;
  let onStub: any;
  let getRabbit: any;
  let getConnection: () => RabbitType.Rabbit;

  beforeEach(async function () {
    config = {
      queue: {
        prefetch: 100,
        url: 'amqp://localhost',
        frameMax: 0x2000,
        maxRetries: 0,
        retryDelay: 1000,
        connectDelay: 5000
      },
      requestContext: { enabled: true, propagatedHeaders: { enabled: true } }
    };
    onStub = mock.fn();
    stub = mock.fn(() => ({
      on: onStub
    }));
    mock.module('rabbit-queue', {
      namedExports: {
        Rabbit: stub,
        BaseQueueHandler: class BaseQueueHandler {
          getCorrelationId() {
            return 'corId';
          }
          handle() {}
          tryHandle() {
            (this as any).handle();
          }
          handleError() {}
        }
      }
    });
    delete require.cache[require.resolve('../../../src/initializers/rabbitmq')];
    ({ default: getRabbit, getRabbit: getConnection } = await import('../../../src/initializers/rabbitmq'));
  });

  afterEach(function () {
    mock.restoreAll();
  });

  it('should connect to rabbitmq', () => {
    const rabbit = getRabbit(config, orkaOptions);
    assert.strictEqual(stub.mock.calls.length, 1);
  });

  it('should not connect to rabbitmq, no config', () => {
    const rabbit = getRabbit({}, orkaOptions);
    assert.strictEqual(stub.mock.calls.length, 0);
  });

  it('should not connect to rabbitmq, already connected', () => {
    getRabbit(config, orkaOptions);
    getRabbit(config, orkaOptions);
    assert.deepStrictEqual(getMockCallArgs(stub), [
      [
        'amqp://localhost?frameMax=8192',
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
    assert.deepStrictEqual(getMockCallArgs(stub), [
      [
        'amqp://localhost?frameMax=8192',
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
    let queueHandler: any;
    let handleStub: any;
    beforeEach(async function () {
      getRabbit(config, orkaOptions);
      const rabbit = getConnection();
      const { BaseQueueHandler } = await import('rabbit-queue');
      handleStub = mock.fn();
      class TestHandler extends BaseQueueHandler {
        handle() {
          const ctx = getRequestContext();
          handleStub(ctx);
          return;
        }
      }
      queueHandler = new TestHandler('test', rabbit, {});
    });

    it('runsTryHandle in context', function () {
      queueHandler.tryHandle();
      assert.deepStrictEqual(getMockCallArgs(handleStub), [[new Map().set('correlationId', 'corId')]]);
    });

    it('getTime as a bigint from logMetrics', function () {
      mock.method(logMetrics, 'start', () => 1 as any);
      assert.strictEqual(queueHandler.getTime(), 1);
    });

    it('logTime from logMetrics', function () {
      const logStub = mock.method(logMetrics, 'end', () => {});
      queueHandler.logTime('args', 1);
      assert.deepStrictEqual(getMockCallArgs(logStub), [['args', undefined, 'queue', 1]]);
    });

    it('handleError adds compatible to HB keys', function () {
      const err: any = new Error('test');
      queueHandler.queueName = 'test';
      queueHandler.handleError(err, {});
      assert.strictEqual(err.action, 'test');
      assert.strictEqual(err.component, 'rabbit-queue');
      assert.deepStrictEqual(err.context, { correlationId: 'corId' });
    });
  });
});
