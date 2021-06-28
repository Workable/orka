import * as sinon from 'sinon';
import * as should from 'should';
import Kafka from '../../../src/initializers/kafka/kafka';
import { BaseKafkaHandler, BaseKafkaBatchHandler } from '../../../src/initializers/kafka/base-kafka-handler';

const sandbox = sinon.createSandbox();
const logger = {
  trace: () => null,
  debug: () => null,
  info: () => null
} as any;

describe('base kafka handler class', async () => {
  let handleStub, consumeStub, runStub, subscribeStub, handleBatchStub, heartBeatStub;

  class TestKafkaHandler extends BaseKafkaHandler<any, any> {
    public async handle(args) {
      handleStub(args);
    }
  }

  class TestKafkaBatchHandler extends BaseKafkaBatchHandler<any, any> {
    public async handleBatch(bulk) {
      handleBatchStub(bulk.messages);
    }
  }

  beforeEach(() => {
    handleStub = sandbox.stub();
    handleBatchStub = sandbox.stub();
    heartBeatStub = sandbox.stub().resolves();
    runStub = sandbox.stub();
    subscribeStub = sandbox.stub();
    consumeStub = {
      subscribe: subscribeStub,
      run: runStub.callsFake(
        async ({ eachMessage: fn, eachBatch: fnBatch }) => {
          if (fnBatch) {
            return fnBatch({
              batch: {
                messages: [{
                  key: Buffer.from('key'),
                  value: Buffer.from('{"msg":"msg"}'),
                  headers: { key: Buffer.from('key') }
                }],
                topic: 'topic',
                partition: '1'
              },
              heartbeat: heartBeatStub,
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
          }).catch(e => console.log(e));
        }
      )
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call consumer with multiple topics', async () => {
    const createConsumer = sandbox.stub(Kafka.prototype, 'createConsumer').resolves(consumeStub);
    const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
    const consumerOptions = { groupId: 'newGroup' };
    const runOptions = { partitionsConsumedConcurrently: 5 };
    const handler = new TestKafkaHandler(kafka, { topic: ['topic1', 'topic2'], consumerOptions, runOptions });
    await new Promise(resolve => setTimeout(resolve, 10));
    createConsumer.calledOnce.should.be.true();
    createConsumer.args.should.eql([[consumerOptions]]);
    subscribeStub.args.should.eql([
      [{ topic: 'topic1', fromBeginning: undefined }],
      [{ topic: 'topic2', fromBeginning: undefined }]
    ]);
    should.equal(undefined, handler.fromBeginning);
    consumeStub.run.args.should.containDeep([[runOptions]]);
    handleStub.args.should.containDeep([[{ value: { msg: 'msg' }, headers: { key: 'key' } }]]);
  });

  it('should call consumer with batch method and call heartbeat', async () => {
    const createConsumer = sandbox.stub(Kafka.prototype, 'createConsumer').resolves(consumeStub);
    const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
    const consumerOptions = { groupId: 'newGroup' };
    const runOptions = { partitionsConsumedConcurrently: 5 };
    const handler = new TestKafkaBatchHandler(kafka, { topic: ['topic1', 'topic2'], consumerOptions, runOptions });
    await new Promise(resolve => setTimeout(resolve, 10));
    createConsumer.calledOnce.should.be.true();
    createConsumer.args.should.eql([[consumerOptions]]);
    subscribeStub.args.should.eql([
      [{ topic: 'topic1', fromBeginning: undefined }],
      [{ topic: 'topic2', fromBeginning: undefined }]
    ]);
    should.equal(undefined, handler.fromBeginning);
    consumeStub.run.args.should.containDeep([[runOptions]]);
    heartBeatStub.calledOnce.should.be.true();
    handleBatchStub.args.should.containDeep([[[{ value: { msg: 'msg' }, headers: { key: 'key' } }]]]);
  });

  context('with autoOffsetReset latest', function () {
    it('should call consumer fromBeginning false', async () => {
      const createConsumer = sandbox.stub(Kafka.prototype, 'createConsumer').resolves(consumeStub);
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
      createConsumer.calledOnce.should.be.true();
      createConsumer.args.should.eql([[consumerOptions]]);
      subscribeStub.args.should.eql([
        [{ topic: 'topic1', fromBeginning: false }],
        [{ topic: 'topic2', fromBeginning: false }]
      ]);
      handler.fromBeginning.should.equal(false);
      consumeStub.run.args.should.containDeep([[runOptions]]);
      handleStub.args.should.containDeep([[{ value: { msg: 'msg' }, headers: { key: 'key' } }]]);
    });
  });

  context('with fromBeginning false', function () {
    it('should call consumer fromBeginning false', async () => {
      const createConsumer = sandbox.stub(Kafka.prototype, 'createConsumer').resolves(consumeStub);
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
      createConsumer.calledOnce.should.be.true();
      createConsumer.args.should.eql([[consumerOptions]]);
      subscribeStub.args.should.eql([
        [{ topic: 'topic1', fromBeginning: false }],
        [{ topic: 'topic2', fromBeginning: false }]
      ]);
      handler.fromBeginning.should.equal(false);
      consumeStub.run.args.should.containDeep([[runOptions]]);
      handleStub.args.should.containDeep([[{ value: { msg: 'msg' }, headers: { key: 'key' } }]]);
    });
  });

  context('with jsonParseValue false, stringifyHeaders false', function () {
    it('should call handler with buffer data', async () => {
      const createConsumer = sandbox.stub(Kafka.prototype, 'createConsumer').resolves(consumeStub);
      const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
      const consumerOptions = { groupId: 'newGroup' };
      const runOptions = { partitionsConsumedConcurrently: 5 };
      const handler = new TestKafkaHandler(kafka, {
        topic: ['topic1', 'topic2'],
        consumerOptions,
        runOptions,
        jsonParseValue: false,
        stringifyHeaders: false
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      createConsumer.calledOnce.should.be.true();
      createConsumer.args.should.eql([[consumerOptions]]);
      subscribeStub.args.should.eql([
        [{ topic: 'topic1', fromBeginning: undefined }],
        [{ topic: 'topic2', fromBeginning: undefined }]
      ]);
      consumeStub.run.args.should.containDeep([[runOptions]]);
      handleStub.args.should.containDeep([
        [{ value: Buffer.from('{"msg":"msg"}'), headers: { key: Buffer.from('key') }, topic: 'topic', partition: '1' }]
      ]);
    });
  });

  context('with onConsumerCreated defined', function () {
    it('should call method', async () => {
      const createConsumer = sandbox.stub(Kafka.prototype, 'createConsumer').resolves(consumeStub);
      const onConsumerCreated = sandbox.spy();
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
      onConsumerCreated.calledOnce.should.be.true();
    });
  });
});
