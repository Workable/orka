import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import Kafka from '../../../src/initializers/kafka/kafka';
import { BaseKafkaHandler, BaseKafkaBatchHandler } from '../../../src/initializers/kafka/base-kafka-handler';
import OrkaBuilder from '../../../src/orka-builder';
import { assertContainsDeep, getMockCallArgs } from '../../helpers/assert-helpers';

describe('base kafka handler class', async () => {
  let handleStub: any, consumeStub: any, runStub: any, subscribeStub: any, handleBatchStub: any, heartBeatStub: any;

  class TestKafkaHandler extends BaseKafkaHandler<any, any> {
    public async handle(args: any) {
      handleStub(args);
    }
  }

  class TestKafkaBatchHandler extends BaseKafkaBatchHandler<any, any> {
    public async handleBatch(bulk: any) {
      handleBatchStub(bulk.messages);
    }
  }

  beforeEach(() => {
    OrkaBuilder.INSTANCE = {
      config: { requestContext: { enabled: true, propagatedHeaders: { enabled: true, headers: 'headers' } } }
    } as any;
    handleStub = mock.fn();
    handleBatchStub = mock.fn();
    heartBeatStub = mock.fn(async () => {});
    runStub = mock.fn();
    subscribeStub = mock.fn();
    consumeStub = {
      subscribe: subscribeStub,
      run: mock.fn(async ({ eachMessage: fn, eachBatch: fnBatch }: any) => {
        if (fnBatch) {
          return fnBatch({
            batch: {
              messages: [
                {
                  key: Buffer.from('key'),
                  value: Buffer.from('{"msg":"msg"}'),
                  headers: { key: Buffer.from('key') }
                }
              ],
              topic: 'topic',
              partition: '1'
            },
            heartbeat: heartBeatStub
          });
        }
        return fn({
          message: {
            key: Buffer.from('key'),
            value: Buffer.from('{"msg":"msg"}'),
            headers: { key: Buffer.from('key') }
          },
          topic: 'topic',
          partition: '1'
        }).catch((e: any) => console.log(e));
      })
    };
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it('should call consumer with multiple topics', async () => {
    const createConsumer = mock.method(Kafka.prototype, 'createConsumer', async () => consumeStub);
    const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
    const consumerOptions = { groupId: 'newGroup' };
    const runOptions = { partitionsConsumedConcurrently: 5 };
    const handler = new TestKafkaHandler(kafka, { topic: ['topic1', 'topic2'], consumerOptions, runOptions });
    await new Promise(resolve => setTimeout(resolve, 10));
    assert.strictEqual(createConsumer.mock.calls.length, 1);
    assert.deepStrictEqual(getMockCallArgs(createConsumer), [[consumerOptions]]);
    assert.deepStrictEqual(getMockCallArgs(subscribeStub), [
      [{ topic: 'topic1', fromBeginning: undefined }],
      [{ topic: 'topic2', fromBeginning: undefined }]
    ]);
    assert.strictEqual(handler.fromBeginning, undefined);
    assertContainsDeep(getMockCallArgs(consumeStub.run), [[runOptions]]);
    assertContainsDeep(getMockCallArgs(handleStub), [[{ value: { msg: 'msg' }, headers: { key: 'key' } }]]);
  });

  it('should call consumer with batch method and call heartbeat', async () => {
    const createConsumer = mock.method(Kafka.prototype, 'createConsumer', async () => consumeStub);
    const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
    const consumerOptions = { groupId: 'newGroup' };
    const runOptions = { partitionsConsumedConcurrently: 5 };
    const handler = new TestKafkaBatchHandler(kafka, { topic: ['topic1', 'topic2'], consumerOptions, runOptions });
    await new Promise(resolve => setTimeout(resolve, 10));
    assert.strictEqual(createConsumer.mock.calls.length, 1);
    assert.deepStrictEqual(getMockCallArgs(createConsumer), [[consumerOptions]]);
    assert.deepStrictEqual(getMockCallArgs(subscribeStub), [
      [{ topic: 'topic1', fromBeginning: undefined }],
      [{ topic: 'topic2', fromBeginning: undefined }]
    ]);
    assert.strictEqual(handler.fromBeginning, undefined);
    assertContainsDeep(getMockCallArgs(consumeStub.run), [[runOptions]]);
    assert.strictEqual(heartBeatStub.mock.calls.length, 1);
    assertContainsDeep(getMockCallArgs(handleBatchStub), [[[{ value: { msg: 'msg' }, headers: { key: 'key' } }]]]);
  });

  describe('with autoOffsetReset latest', function () {
    it('should call consumer fromBeginning false', async () => {
      const createConsumer = mock.method(Kafka.prototype, 'createConsumer', async () => consumeStub);
      const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
      const consumerOptions = { groupId: 'newGroup' };
      const runOptions = { partitionsConsumedConcurrently: 5 };
      const handler = new TestKafkaHandler(kafka, {
        topic: ['topic1', 'topic2'],
        consumerOptions,
        runOptions,
        autoOffsetReset: 'latest'
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      assert.strictEqual(createConsumer.mock.calls.length, 1);
      assert.deepStrictEqual(getMockCallArgs(createConsumer), [[consumerOptions]]);
      assert.deepStrictEqual(getMockCallArgs(subscribeStub), [
        [{ topic: 'topic1', fromBeginning: false }],
        [{ topic: 'topic2', fromBeginning: false }]
      ]);
      assert.strictEqual(handler.fromBeginning, false);
      assertContainsDeep(getMockCallArgs(consumeStub.run), [[runOptions]]);
      assertContainsDeep(getMockCallArgs(handleStub), [[{ value: { msg: 'msg' }, headers: { key: 'key' } }]]);
    });
  });

  describe('with fromBeginning false', function () {
    it('should call consumer fromBeginning false', async () => {
      const createConsumer = mock.method(Kafka.prototype, 'createConsumer', async () => consumeStub);
      const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
      const consumerOptions = { groupId: 'newGroup' };
      const runOptions = { partitionsConsumedConcurrently: 5 };
      const handler = new TestKafkaHandler(kafka, {
        topic: ['topic1', 'topic2'],
        consumerOptions,
        runOptions,
        fromBeginning: false
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      assert.strictEqual(createConsumer.mock.calls.length, 1);
      assert.deepStrictEqual(getMockCallArgs(createConsumer), [[consumerOptions]]);
      assert.deepStrictEqual(getMockCallArgs(subscribeStub), [
        [{ topic: 'topic1', fromBeginning: false }],
        [{ topic: 'topic2', fromBeginning: false }]
      ]);
      assert.strictEqual(handler.fromBeginning, false);
      assertContainsDeep(getMockCallArgs(consumeStub.run), [[runOptions]]);
      assertContainsDeep(getMockCallArgs(handleStub), [[{ value: { msg: 'msg' }, headers: { key: 'key' } }]]);
    });
  });

  describe('with jsonParseValue false', function () {
    it('should call handler with buffer data', async () => {
      const createConsumer = mock.method(Kafka.prototype, 'createConsumer', async () => consumeStub);
      const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
      const consumerOptions = { groupId: 'newGroup' };
      const runOptions = { partitionsConsumedConcurrently: 5 };
      const handler = new TestKafkaHandler(kafka, {
        topic: ['topic1', 'topic2'],
        consumerOptions,
        runOptions,
        jsonParseValue: false
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      assert.strictEqual(createConsumer.mock.calls.length, 1);
      assert.deepStrictEqual(getMockCallArgs(createConsumer), [[consumerOptions]]);
      assert.deepStrictEqual(getMockCallArgs(subscribeStub), [
        [{ topic: 'topic1', fromBeginning: undefined }],
        [{ topic: 'topic2', fromBeginning: undefined }]
      ]);
      assertContainsDeep(getMockCallArgs(consumeStub.run), [[runOptions]]);
      assertContainsDeep(getMockCallArgs(handleStub), [
        [{ value: Buffer.from('{"msg":"msg"}'), headers: { key: 'key' }, topic: 'topic', partition: '1' }]
      ]);
    });
  });

  describe('with onConsumerCreated defined', function () {
    it('should call method', async () => {
      const createConsumer = mock.method(Kafka.prototype, 'createConsumer', async () => consumeStub);
      const onConsumerCreated = mock.fn();
      const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
      const consumerOptions = { groupId: 'newGroup' };
      const runOptions = { partitionsConsumedConcurrently: 5 };
      const handler = new TestKafkaHandler(kafka, {
        topic: ['topic1', 'topic2'],
        consumerOptions,
        runOptions,
        fromBeginning: false,
        onConsumerCreated
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      assert.strictEqual(onConsumerCreated.mock.calls.length, 1);
    });
  });
});
