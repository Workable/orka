import * as sinon from 'sinon';
import 'should';
import type KafkaType from '../../../src/initializers/kafka/kafka';
const sandbox = sinon.createSandbox();
const mock = require('mock-require');

describe('kafka class', () => {
  let producerStub;
  let consumerStub;
  let adminStub;
  let kafkaStub;
  let fetchTopicMetadataStub;
  let createTopicsStub;
  let kafkaStubReturn;
  let fetchOffsetsStub;
  let setOffsetsStub;
  let Kafka: typeof KafkaType;

  beforeEach(async function () {
    producerStub = {
      connect: sandbox.stub(),
      send: sandbox.stub().returns([{}]),
      sendBatch: sandbox.stub().returns({}),
      disconnect: sandbox.stub().returns({})
    };
    consumerStub = sandbox.stub().returns({ connect: sandbox.stub() });
    fetchTopicMetadataStub = sandbox.stub().resolves('metadata');
    createTopicsStub = sandbox.stub().onFirstCall().resolves(true).resolves(false);
    fetchOffsetsStub = sandbox.stub();
    setOffsetsStub = sandbox.stub();
    adminStub = sandbox.stub().returns({
      connect: sandbox.stub(),
      disconnect: sandbox.stub(),
      fetchTopicMetadata: fetchTopicMetadataStub,
      createTopics: createTopicsStub,
      fetchOffsets: fetchOffsetsStub,
      setOffsets: setOffsetsStub
    });
    kafkaStubReturn = { producer: () => producerStub, consumer: consumerStub, admin: adminStub };
    kafkaStub = sinon.stub().returns(kafkaStubReturn);
    delete require.cache[require.resolve('../../../src/initializers/kafka/kafka')];
    mock('kafkajs', { Kafka: kafkaStub });
    ({ default: Kafka } = await import('../../../src/initializers/kafka/kafka'));
  });

  afterEach(function () {
    sandbox.restore();
    mock.stopAll();
  });

  describe('connect, send', function () {
    context('with certificates', function () {
      it('should call correct methods with correct args', async () => {
        const kafka = new Kafka({
          certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false }
          }
        });
        await kafka.connect();
        producerStub.connect.calledOnce.should.eql(true);

        await kafka.send('topic', 'msg', null, null, [{ header1: 'header' }, { header2: 'header' }]);
        kafkaStub.args.should.containDeep([
          [
            {
              brokers: ['broker-producer'],
              clientId: 'clientId',
              ssl: { ca: ['ca'], cert: 'cert', key: 'key', rejectUnauthorized: false }
            }
          ]
        ]);
        producerStub.send.args.should.containDeep([
          [{ messages: [{ headers: { header1: 'header', header2: 'header' }, value: 'msg' }], topic: 'topic' }]
        ]);
      });
    });

    context('without headers', function () {
      it('should call correct methods with correct args', async () => {
        const kafka = new Kafka({
          certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false }
          }
        });
        await kafka.connect();
        producerStub.connect.calledOnce.should.eql(true);

        await kafka.send('topic', 'msg', null, null);
        kafkaStub.args.should.containDeep([
          [
            {
              brokers: ['broker-producer'],
              clientId: 'clientId',
              ssl: { ca: ['ca'], cert: 'cert', key: 'key', rejectUnauthorized: false }
            }
          ]
        ]);
        producerStub.send.args.should.containDeep([[{ messages: [{ value: 'msg' }], topic: 'topic' }]]);
      });
    });

    context('with ssl', function () {
      it('should call correct methods with correct args', async () => {
        const kafka = new Kafka({
          sasl: { mechanism: 'scram-sha-256', password: 'foo', username: 'bar' },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            sasl: { mechanism: 'scram-sha-256', password: 'foo-producer', username: 'bar' },
            ssl: true
          }
        });
        const producerConfig = { maxInFlightRequests: 10 };
        const producerSpy = sandbox.spy(kafkaStubReturn, 'producer');
        await kafka.connect(producerConfig);
        producerStub.connect.calledOnce.should.eql(true);

        await kafka.send('topic', 'msg', null, null, [{ header1: 'header' }, { header2: 'header' }]);
        producerSpy.args.should.eql([[producerConfig]]);
        kafkaStub.args.should.containDeep([
          [
            {
              brokers: ['broker-producer'],
              clientId: 'clientId',
              ssl: true,
              sasl: { mechanism: 'scram-sha-256', password: 'foo-producer', username: 'bar' }
            }
          ]
        ]);
        producerStub.send.args.should.containDeep([
          [{ messages: [{ headers: { header1: 'header', header2: 'header' }, value: 'msg' }], topic: 'topic' }]
        ]);
      });
    });
  });

  describe('createConsumer', function () {
    context('with certificates', function () {
      it('should call correct methods with correct args', async () => {
        const kafka = new Kafka({
          certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false }
          }
        });
        await kafka.createConsumer();
        consumerStub.args.should.eql([[{ groupId: 'groupId' }]]);
        kafkaStub.args.should.containDeep([
          [
            {
              brokers: ['broker-consumer'],
              clientId: 'clientId',
              ssl: { ca: ['ca'], cert: 'cert', key: 'key', rejectUnauthorized: false }
            }
          ]
        ]);
      });
    });

    context('with ssl', function () {
      it('should call correct methods with correct args', async () => {
        const kafka = new Kafka({
          sasl: { mechanism: 'scram-sha-256', password: 'foo', username: 'bar' },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            sasl: { mechanism: 'scram-sha-256', password: 'foo-producer', username: 'bar' }
          },
          ssl: true
        });
        await kafka.createConsumer({ groupId: 'foo' });
        consumerStub.args.should.eql([[{ groupId: 'foo' }]]);

        kafkaStub.args.should.containDeep([
          [
            {
              brokers: ['broker-consumer'],
              clientId: 'clientId',
              ssl: true,
              sasl: { mechanism: 'scram-sha-256', password: 'foo', username: 'bar' }
            }
          ]
        ]);
      });
    });
  });

  describe('connectAdmin', function () {
    context('with certificates', function () {
      it('should call correct methods with correct args', async () => {
        const kafka = new Kafka({
          certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false }
          }
        });
        await kafka.connectAdmin();
        adminStub.args.should.eql([[]]);
        kafkaStub.args.should.containDeep([
          [
            {
              brokers: ['broker-consumer'],
              clientId: 'clientId',
              ssl: { ca: ['ca'], cert: 'cert', key: 'key', rejectUnauthorized: false }
            }
          ]
        ]);
      });
    });

    context('with ssl', function () {
      it('should call correct methods with correct args', async () => {
        const kafka = new Kafka({
          sasl: { mechanism: 'scram-sha-256', password: 'foo', username: 'bar' },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            sasl: { mechanism: 'scram-sha-256', password: 'foo-producer', username: 'bar' }
          },
          ssl: true
        });
        await kafka.connectAdmin();
        adminStub.args.should.eql([[]]);

        kafkaStub.args.should.containDeep([
          [
            {
              brokers: ['broker-consumer'],
              clientId: 'clientId',
              ssl: true,
              sasl: { mechanism: 'scram-sha-256', password: 'foo', username: 'bar' }
            }
          ]
        ]);
      });
    });
  });

  describe('metadata', function () {
    it('returns metadata', async function () {
      const kafka = new Kafka({
        sasl: { mechanism: 'scram-sha-256', password: 'foo', username: 'bar' },
        groupId: 'groupId',
        clientId: 'clientId',
        brokers: ['broker-consumer'],
        producer: {
          brokers: ['broker-producer'],
          sasl: { mechanism: 'scram-sha-256', password: 'foo-producer', username: 'bar' }
        },
        ssl: true
      });
      const response = await kafka.metadata();
      adminStub.args.should.eql([[]]);
      fetchTopicMetadataStub.args.should.eql([[]]);
      response.should.eql('metadata');
    });
  });

  describe('createTopics', function () {
    it('creates topics', async function () {
      const kafka = new Kafka({
        sasl: { mechanism: 'scram-sha-256', password: 'foo', username: 'bar' },
        groupId: 'groupId',
        clientId: 'clientId',
        brokers: ['broker-consumer'],
        producer: {
          brokers: ['broker-producer'],
          sasl: { mechanism: 'scram-sha-256', password: 'foo-producer', username: 'bar' }
        },
        ssl: true
      });
      const response = await kafka.createTopics([
        { topic: 'foo', numPartitions: 10, replicationFactor: 1 },
        { topic: 'bar', numPartitions: 10, replicationFactor: 1 },
        { topic: 'test', numPartitions: 10, replicationFactor: 1 }
      ]);
      adminStub.args.should.eql([[]]);
      createTopicsStub.args.should.eql([
        [{ topics: [{ numPartitions: 10, replicationFactor: 1, topic: 'foo' }] }],
        [{ topics: [{ numPartitions: 10, replicationFactor: 1, topic: 'bar' }] }],
        [{ topics: [{ numPartitions: 10, replicationFactor: 1, topic: 'test' }] }]
      ]);
      response.should.eql([{ foo: true }, { bar: false }, { test: false }]);
    });
  });

  describe('renameGroupId', function () {
    it('copies offsets from old groupId-topic combination', async function () {
      const kafka = new Kafka({
        sasl: { mechanism: 'scram-sha-256', password: 'foo', username: 'bar' },
        groupId: 'groupId',
        clientId: 'clientId',
        brokers: ['broker-consumer'],
        producer: {
          brokers: ['broker-producer'],
          sasl: { mechanism: 'scram-sha-256', password: 'foo-producer', username: 'bar' }
        },
        ssl: true
      });
      fetchOffsetsStub.onFirstCall().returns([{ partition: 0, offset: '-1' }]);
      fetchOffsetsStub.onSecondCall().returns([{ partition: 0, offset: '5' }]);
      fetchOffsetsStub.onThirdCall().returns([{ partition: 0, offset: '-1' }]);
      fetchOffsetsStub.onCall(3).returns([
        { partition: 0, offset: '3' },
        { partition: 1, offset: '-1' }
      ]);
      fetchOffsetsStub.returns([{ partition: 0, offset: '-1' }]);
      const response = await kafka.renameGroupId([
        { groupId: 'newGroupId', topic: 'topic', oldGroupId: 'oldGroupId' },
        { groupId: 'newGroupId2', topic: 'topic2', oldGroupId: 'oldGroupId2' },
        { groupId: 'newGroupId3', topic: 'topic3', oldGroupId: 'oldGroupId3' }
      ]);

      adminStub.args.should.eql([[]]);
      fetchOffsetsStub.args.should.eql([
        [{ groupId: 'newGroupId', topic: 'topic', resolveOffsets: false }],
        [{ groupId: 'newGroupId2', topic: 'topic2', resolveOffsets: false }],
        [{ groupId: 'newGroupId3', topic: 'topic3', resolveOffsets: false }],
        [{ groupId: 'oldGroupId', topic: 'topic', resolveOffsets: false }],
        [{ groupId: 'oldGroupId3', topic: 'topic3', resolveOffsets: false }]
      ]);
      setOffsetsStub.args.should.eql([
        [{ groupId: 'newGroupId', partitions: [{ offset: '3', partition: 0 }], topic: 'topic' }]
      ]);
      response.should.eql([
        { groupId: 'newGroupId', oldOffsets: [{ offset: '3', partition: 0 }], renamedFrom: 'oldGroupId' },
        { alreadyDeclared: true, groupId: 'newGroupId2', renamedFrom: 'oldGroupId2' },
        { groupId: 'newGroupId3', oldOffsets: [], renamedFrom: 'oldGroupId3' }
      ]);
    });
  });
});
