import * as sinon from 'sinon';
import 'should';
import Kafka from '../../../src/initializers/kafka/kafka';
import BaseKafkaHandler from '../../../src/initializers/kafka/base-kafka-handler';
import { getLogger } from '../../../src/initializers/log4js';

const sandbox = sinon.sandbox.create();

describe('base kafka handler class', async () => {
  const cbStub = sinon.stub();
  const handleStub = sinon.stub();
  const producerStub = { connect: sandbox.stub(), on: sandbox.stub(), send: sandbox.stub().returns({}) };
  const consumeStub = {
    connect: sinon.stub().returns(Promise.resolve()),
    commit: sinon.stub(),
    consume: sinon.stub().callsFake(async fn => await fn({ value: 'msg' }, cbStub))
  };
  class TestKafkaHandler extends BaseKafkaHandler {
    public async handle(message: any) {
      handleStub(message);
    }
  }

  afterEach(() => {
    sandbox.restore();
  });

  it('should call correct methods with correct args', async () => {
    sandbox.stub(Kafka.prototype, 'createProducer').returns(producerStub);
    sandbox.stub(Kafka.prototype, 'createConsumer').returns(consumeStub);
    const kafka = new Kafka({ groupId: 'groupId', clientId: 'clientId', brokers: [] } as any);
    const handler = new TestKafkaHandler(kafka, { topic: 'topic', logger: getLogger('test'), batchSize: 2 });
    await new Promise(resolve => setTimeout(resolve, 10));
    consumeStub.connect.calledOnce.should.eql(true);
    consumeStub.consume.calledOnce.should.eql(true);
    consumeStub.commit.calledOnce.should.eql(true);
    handleStub.calledOnce.should.eql(true);
    cbStub.calledOnce.should.eql(true);
    handleStub.calledWith('msg');
    consumeStub.commit.calledWith(false);
  });
});
