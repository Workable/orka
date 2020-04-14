import * as sinon from 'sinon';
import 'should';
import Kafka from '../../../src/initializers/kafka/kafka';
import BaseKafkaHandler from '../../../src/initializers/kafka/base-kafka-handler';

const sandbox = sinon.createSandbox();
const logger = {
  trace: () => null,
  debug: () => null,
  info: () => null
} as any;

describe('base kafka handler class', async () => {
  let cbStub, handleStub, producerStub, consumeStub;

  class TestKafkaHandler extends BaseKafkaHandler<any, any> {
    public async handle(...args) {
      handleStub(args);
    }
  }

  function assertConsume() {
    consumeStub.connect.calledOnce.should.be.true();
    consumeStub.consume.calledOnce.should.be.true();
    consumeStub.commit.calledOnce.should.be.true();
    handleStub.calledOnce.should.be.true();
    cbStub.calledOnce.should.be.true();
    handleStub.calledWith('msg');
    consumeStub.commit.calledWith(false);
  }

  beforeEach(() => {
    cbStub = sinon.stub();
    handleStub = sinon.stub();
    producerStub = { connect: sandbox.stub(), on: sandbox.stub(), send: sandbox.stub().returns({}) };
    consumeStub = {
      connect: sinon.stub().returns(Promise.resolve()),
      commit: sinon.stub(),
      consume: sinon.stub().callsFake(async fn => await fn({ value: 'msg' }, cbStub))
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('with default autoOffsetReset', () => {
    it('should call correct methods with correct args', async () => {
      sandbox.stub(Kafka.prototype, 'createProducer').returns(producerStub);
      const createConsumer = sandbox.stub(Kafka.prototype, 'createConsumer').returns(consumeStub);
      const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
      const handler = new TestKafkaHandler(kafka, { topic: 'topic', logger, batchSize: 2 });
      await new Promise(resolve => setTimeout(resolve, 10));
      sandbox.assert.calledOnce(createConsumer);
      sandbox.assert.calledWith(createConsumer, 'topic');
      handler.autoOffsetReset.should.be.equal('earliest');
      assertConsume();
    });
  });

  describe('with autoOffsetReset latest', () => {
    it('should call correct methods with correct args', async () => {
      sandbox.stub(Kafka.prototype, 'createProducer').returns(producerStub);
      const createConsumer = sandbox.stub(Kafka.prototype, 'createConsumer').returns(consumeStub);
      const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
      const handler = new TestKafkaHandler(kafka, { topic: 'topic', logger, batchSize: 2, autoOffsetReset: 'latest' });
      await new Promise(resolve => setTimeout(resolve, 10));
      sandbox.assert.calledOnce(createConsumer);
      sandbox.assert.calledWith(createConsumer, 'topic', 'latest');
      handler.autoOffsetReset.should.be.equal('latest');
      assertConsume();
    });
  });
});
