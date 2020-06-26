import * as sinon from 'sinon';
import 'should';
import Kafka from '../../../src/initializers/kafka/kafka';
import * as tmp from 'tmp';
import * as fs from 'fs';

const sandbox = sinon.createSandbox();

describe('kafka class', () => {
  const producerStub = { connect: sandbox.stub(), on: sandbox.stub(), send: sandbox.stub().returns({}) };
  const consumeStub = {};
  before(() => {
    sandbox.stub(fs, 'writeFileSync');
    sandbox.stub(tmp, 'fileSync').returns({ name: 'tmpkey' } as any);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call correct methods with correct args', async () => {
    sandbox.stub(Kafka.prototype, 'createProducer').returns(producerStub);
    sandbox.stub(Kafka.prototype, 'createConsumer').returns(consumeStub);
    const kafka = new Kafka({
      certificates: {
        key: 'key',
        cert: 'cert',
        ca: 'ca'
      },
      groupId: 'groupId',
      clientId: 'clientId',
      brokers: [],
      producer: {
        brokers: ['broker1']
      }
    });
    await kafka.connect();
    producerStub.connect.calledOnce.should.eql(true);
    producerStub.on.calledOnce.should.eql(true);
    producerStub.connect.calledOnce.should.eql(true);
    producerStub.on.calledWith('error').should.eql(true);

    await kafka.send('topic', 'msg');
    producerStub.send.calledWith('topic', 'msg').should.eql(true);
  });
});
