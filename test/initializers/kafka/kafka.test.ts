import * as sinon from 'sinon';
import 'should';
import type KafkaType from '../../../src/initializers/kafka/kafka';
import { Partitioners } from 'kafkajs';

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
  let listTopicsStub;
  let Kafka: typeof KafkaType;
  let kafka: KafkaType;

  beforeEach(async function () {
    producerStub = {
      connect: sandbox.stub(),
      send: sandbox.stub().returns([{}]),
      sendBatch: sandbox.stub().returns({}),
      disconnect: sandbox.stub().returns({}),
      on: sandbox.stub(),
      events: {
        CONNECT: 'producer.connect',
        DISCONNECT: 'producer.disconnect'
      }
    };
    consumerStub = sandbox.stub().returns({
      connect: sandbox.stub().resolves(),
      disconnect: sandbox.stub().resolves(),
      on: sandbox.stub()
    });
    fetchTopicMetadataStub = sandbox.stub().resolves('metadata');
    createTopicsStub = sandbox.stub().onFirstCall().resolves(true).resolves(false);
    fetchOffsetsStub = sandbox.stub();
    setOffsetsStub = sandbox.stub();
    listTopicsStub = sandbox.stub().resolves([]);
    adminStub = sandbox.stub().returns({
      connect: sandbox.stub(),
      disconnect: sandbox.stub(),
      fetchTopicMetadata: fetchTopicMetadataStub,
      createTopics: createTopicsStub,
      fetchOffsets: fetchOffsetsStub,
      setOffsets: setOffsetsStub,
      listTopics: listTopicsStub
    });
    kafkaStubReturn = { producer: () => producerStub, consumer: consumerStub, admin: adminStub };
    kafkaStub = sinon.stub().returns(kafkaStubReturn);
    delete require.cache[require.resolve('../../../src/initializers/kafka/kafka')];
    mock('kafkajs', { Kafka: kafkaStub, Partitioners });
    ({ default: Kafka } = await import('../../../src/initializers/kafka/kafka'));
  });

  afterEach(function () {
    sandbox.restore();
    mock.stopAll();
    kafka?.disconnect();
  });

  describe('connect', function () {
    context('with certificates', function () {
      it('should call correct methods with correct args', async () => {
        kafka = new Kafka({
          certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false }
          },
          connectionTimeout: 5000,
          authenticationTimeout: 10000
        });
        await kafka.connect();
        producerStub.connect.calledOnce.should.eql(true);

        kafkaStub.args.should.containDeep([
          [
            {
              brokers: ['broker-producer'],
              clientId: 'clientId',
              ssl: { ca: ['ca'], cert: 'cert', key: 'key', rejectUnauthorized: false }
            }
          ]
        ]);
      });
    });

    context('without headers', function () {
      it('should call correct methods with correct args', async () => {
        kafka = new Kafka({
          certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false }
          },
          connectionTimeout: 5000,
          authenticationTimeout: 10000
        });
        await kafka.connect();
        producerStub.connect.calledOnce.should.eql(true);

        kafkaStub.args.should.containDeep([
          [
            {
              brokers: ['broker-producer'],
              clientId: 'clientId',
              ssl: { ca: ['ca'], cert: 'cert', key: 'key', rejectUnauthorized: false }
            }
          ]
        ]);
      });
    });

    context('with ssl', function () {
      it('should call correct methods with correct args', async () => {
        kafka = new Kafka({
          sasl: { mechanism: 'scram-sha-256', password: 'foo', username: 'bar' },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            sasl: { mechanism: 'scram-sha-256', password: 'foo-producer', username: 'bar' },
            ssl: true
          },
          connectionTimeout: 5000,
          authenticationTimeout: 10000
        });
        const producerConfig = { maxInFlightRequests: 10 };
        const producerSpy = sandbox.spy(kafkaStubReturn, 'producer');
        await kafka.connect(producerConfig);
        producerStub.connect.calledOnce.should.eql(true);

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
      });
    });
  });

  describe('createConsumer', function () {
    context('with certificates', function () {
      it('should call correct methods with correct args', async () => {
        kafka = new Kafka({
          certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false }
          },
          connectionTimeout: 5000,
          authenticationTimeout: 10000
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
        kafka = new Kafka({
          sasl: { mechanism: 'scram-sha-256', password: 'foo', username: 'bar' },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            sasl: { mechanism: 'scram-sha-256', password: 'foo-producer', username: 'bar' }
          },
          ssl: true,
          connectionTimeout: 5000,
          authenticationTimeout: 10000
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
        kafka = new Kafka({
          certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false }
          },
          connectionTimeout: 5000,
          authenticationTimeout: 10000
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
        kafka = new Kafka({
          sasl: { mechanism: 'scram-sha-256', password: 'foo', username: 'bar' },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            sasl: { mechanism: 'scram-sha-256', password: 'foo-producer', username: 'bar' }
          },
          ssl: true,
          connectionTimeout: 5000,
          authenticationTimeout: 10000
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

      it('should register sigtermHandler in SIGTERM process listeners and remove on disconnect', async function () {
        kafka = new Kafka({
          certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false }
          },
          connectionTimeout: 5000,
          authenticationTimeout: 10000
        });

        const handler = (kafka as any).sigtermHandler;

        process.listeners('SIGTERM').should.containEql(handler);

        await kafka.disconnect();

        process.listeners('SIGTERM').should.not.containEql(handler);
      });

      it('should disconnect consumers on SIGTERM', async () => {
        kafka = new Kafka({
          certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false },
          groupId: 'groupId',
          clientId: 'clientId',
          brokers: ['broker-consumer'],
          producer: {
            brokers: ['broker-producer'],
            certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false }
          },
          connectionTimeout: 5000,
          authenticationTimeout: 10000
        });
        await kafka.createConsumer();

        (kafka as any).handleSigterm();
        await kafka.shutdown();

        consumerStub().disconnect.calledOnce.should.eql(true);
      });
    });
  });

  describe('metadata', function () {
    it('returns metadata', async function () {
      kafka = new Kafka({
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
      kafka = new Kafka({
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
    it('creates topics that do not exist', async function () {
      kafka = new Kafka({
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
      listTopicsStub.resolves(['foo', 'test']);
      const response = await kafka.createTopics([
        { topic: 'foo', numPartitions: 10, replicationFactor: 1 },
        { topic: 'bar', numPartitions: 10, replicationFactor: 1 },
        { topic: 'test', numPartitions: 10, replicationFactor: 1 }
      ]);
      adminStub.args.should.eql([[]]);
      createTopicsStub.args.should.eql([[{ topics: [{ numPartitions: 10, replicationFactor: 1, topic: 'bar' }] }]]);
      response.should.eql([{ bar: true }]);
    });
  });

  describe('renameGroupId', function () {
    it('copies offsets from old groupId-topic combination', async function () {
      kafka = new Kafka({
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
      fetchOffsetsStub.onFirstCall().returns([{ topic: 'topic', partitions: [{ partition: 0, offset: '-1' }] }]);
      fetchOffsetsStub.onSecondCall().returns([{ topic: 'topic2', partitions: [{ partition: 0, offset: '5' }] }]);
      fetchOffsetsStub.onThirdCall().returns([{ topic: 'topic3', partitions: [{ partition: 0, offset: '-1' }] }]);

      fetchOffsetsStub.onCall(3).returns([
        {
          partitions: [
            { partition: 0, offset: '3' },
            { partition: 1, offset: '-1' }
          ]
        }
      ]);
      fetchOffsetsStub.returns([{ partitions: [{ partition: 0, offset: '-1' }] }]);
      const response = await kafka.renameGroupId([
        { groupId: 'newGroupId', topic: 'topic', oldGroupId: 'oldGroupId' },
        { groupId: 'newGroupId2', topic: 'topic2', oldGroupId: 'oldGroupId2' },
        { groupId: 'newGroupId3', topic: 'topic3', oldGroupId: 'oldGroupId3' }
      ]);

      adminStub.args.should.eql([[]]);
      fetchOffsetsStub.args.should.eql([
        [{ groupId: 'newGroupId', topics: ['topic'], resolveOffsets: false }],
        [{ groupId: 'newGroupId2', topics: ['topic2'], resolveOffsets: false }],
        [{ groupId: 'newGroupId3', topics: ['topic3'], resolveOffsets: false }],
        [{ groupId: 'oldGroupId', topics: ['topic'], resolveOffsets: false }],
        [{ groupId: 'oldGroupId3', topics: ['topic3'], resolveOffsets: false }]
      ]);
      setOffsetsStub.args.should.eql([
        [{ groupId: 'newGroupId', partitions: [{ offset: '3', partition: 0 }], topic: 'topic' }]
      ]);
      response.should.eql([
        {
          groupId: 'newGroupId',
          oldOffsets: [{ offset: '3', partition: 0 }],
          topic: 'topic',
          renamedFrom: 'oldGroupId'
        },
        { alreadyDeclared: true, groupId: 'newGroupId2', topic: 'topic2', renamedFrom: 'oldGroupId2' },
        { groupId: 'newGroupId3', oldOffsets: [], topic: 'topic3', renamedFrom: 'oldGroupId3' }
      ]);
    });
  });

  describe('shutdown', function () {
    function kafkaOptions(overrides = {}) {
      return {
        certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false },
        groupId: 'groupId',
        clientId: 'clientId',
        brokers: ['broker-consumer'],
        producer: {
          brokers: ['broker-producer'],
          certificates: { key: 'key', cert: 'cert', ca: 'ca', rejectUnauthorized: false }
        },
        connectionTimeout: 5000,
        authenticationTimeout: 10000,
        ...overrides
      };
    }

    function consumerDouble() {
      return {
        connect: sandbox.stub().resolves(),
        disconnect: sandbox.stub().resolves(),
        on: sandbox.stub()
      };
    }

    it('keeps the SIGTERM listener until shutdown finishes', async () => {
      kafka = new Kafka(kafkaOptions());
      const hanging = consumerDouble();
      let release: () => void = () => undefined;
      hanging.disconnect.returns(
        new Promise<void>(resolve => {
          release = resolve;
        })
      );
      consumerStub.returns(hanging);
      await kafka.createConsumer();

      const handler = (kafka as any).sigtermHandler;
      const pending = kafka.shutdown();

      process.listeners('SIGTERM').should.containEql(handler);

      release();
      await pending;

      process.listeners('SIGTERM').should.not.containEql(handler);
    });

    it('disconnects the producer only after every consumer has settled', async () => {
      kafka = new Kafka(kafkaOptions());
      await kafka.connect();

      const first = consumerDouble();
      const second = consumerDouble();
      let releaseFirst: () => void = () => undefined;
      first.disconnect.returns(
        new Promise<void>(resolve => {
          releaseFirst = resolve;
        })
      );
      consumerStub.onCall(0).returns(first);
      consumerStub.onCall(1).returns(second);

      await kafka.createConsumer({ groupId: 'group-a' });
      await kafka.createConsumer({ groupId: 'group-b' });

      const pending = kafka.shutdown();

      first.disconnect.calledOnce.should.eql(true);
      second.disconnect.calledOnce.should.eql(true);
      producerStub.disconnect.called.should.eql(false);

      releaseFirst();
      const result = await pending;

      result.should.eql({ timedOut: false });
      producerStub.disconnect.calledOnce.should.eql(true);
    });

    it('keeps draining when a consumer disconnect rejects', async () => {
      kafka = new Kafka(kafkaOptions());
      await kafka.connect();

      const first = consumerDouble();
      const second = consumerDouble();
      first.disconnect.rejects(new Error('disconnect failed'));
      consumerStub.onCall(0).returns(first);
      consumerStub.onCall(1).returns(second);

      await kafka.createConsumer({ groupId: 'group-a' });
      await kafka.createConsumer({ groupId: 'group-b' });

      const result = await kafka.shutdown();

      result.should.eql({ timedOut: false });
      first.disconnect.calledOnce.should.eql(true);
      second.disconnect.calledOnce.should.eql(true);
      producerStub.disconnect.calledOnce.should.eql(true);
    });

    it('resolves with timedOut when disconnect never settles', async () => {
      kafka = new Kafka(kafkaOptions({ shutdownTimeoutMs: 50 }));
      await kafka.connect();

      const hanging = consumerDouble();
      hanging.disconnect.returns(new Promise(() => undefined));
      consumerStub.returns(hanging);
      await kafka.createConsumer();

      const clock = sandbox.useFakeTimers();
      const pending = kafka.shutdown();
      await clock.tickAsync(50);
      const result = await pending;

      result.should.eql({ timedOut: true });
      producerStub.disconnect.called.should.eql(false);
    });

    it('shares one drain across shutdown and SIGTERM', async () => {
      kafka = new Kafka(kafkaOptions());
      await kafka.createConsumer();

      (kafka as any).handleSigterm();
      const pending = kafka.shutdown();
      const again = kafka.shutdown();

      pending.should.equal(again);
      await pending;
      consumerStub().disconnect.calledOnce.should.eql(true);
    });

    it('disconnects every consumer that shares a group id', async () => {
      kafka = new Kafka(kafkaOptions());
      const first = consumerDouble();
      const second = consumerDouble();
      consumerStub.onCall(0).returns(first);
      consumerStub.onCall(1).returns(second);

      await kafka.createConsumer({ groupId: 'shared' });
      await kafka.createConsumer({ groupId: 'shared' });
      await kafka.shutdown();

      first.disconnect.calledOnce.should.eql(true);
      second.disconnect.calledOnce.should.eql(true);
    });

    it('does not connect a consumer after shutdown has started', async () => {
      kafka = new Kafka(kafkaOptions());
      await kafka.shutdown();

      let message = '';
      try {
        await kafka.createConsumer();
      } catch (err) {
        message = err.message;
      }

      message.should.eql('Kafka shutdown in progress. Refusing to create a new consumer.');
      consumerStub.called.should.eql(false);
    });
  });
});
