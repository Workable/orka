import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import type KafkaType from '../../../src/initializers/kafka/kafka';
import { Partitioners } from 'kafkajs';
import { assertContainsDeep, getMockCallArgs } from '../../helpers/assert-helpers';

describe('kafka class', () => {
  let producerStub: any;
  let consumerStub: any;
  let adminStub: any;
  let kafkaStub: any;
  let fetchTopicMetadataStub: any;
  let createTopicsStub: any;
  let kafkaStubReturn: any;
  let fetchOffsetsStub: any;
  let setOffsetsStub: any;
  let listTopicsStub: any;
  let Kafka: typeof KafkaType;

  beforeEach(async function () {
    const connectMock = mock.fn();
    const sendMock = mock.fn(() => [{}]);
    const sendBatchMock = mock.fn(() => ({}));
    const disconnectMock = mock.fn(() => ({}));
    const onMock = mock.fn();

    producerStub = {
      connect: connectMock,
      send: sendMock,
      sendBatch: sendBatchMock,
      disconnect: disconnectMock,
      on: onMock,
      events: {
        CONNECT: 'producer.connect',
        DISCONNECT: 'producer.disconnect'
      }
    };

    const consumerConnectMock = mock.fn();
    const consumerOnMock = mock.fn();
    consumerStub = mock.fn(() => ({
      connect: consumerConnectMock,
      on: consumerOnMock
    }));

    fetchTopicMetadataStub = mock.fn(async () => 'metadata');

    let createTopicsCallCount = 0;
    createTopicsStub = mock.fn(async () => {
      createTopicsCallCount++;
      return createTopicsCallCount === 1 ? true : false;
    });

    fetchOffsetsStub = mock.fn();
    setOffsetsStub = mock.fn();
    listTopicsStub = mock.fn(async () => []);

    const adminConnectMock = mock.fn();
    const adminDisconnectMock = mock.fn();
    adminStub = mock.fn(() => ({
      connect: adminConnectMock,
      disconnect: adminDisconnectMock,
      fetchTopicMetadata: fetchTopicMetadataStub,
      createTopics: createTopicsStub,
      fetchOffsets: fetchOffsetsStub,
      setOffsets: setOffsetsStub,
      listTopics: listTopicsStub
    }));

    kafkaStubReturn = { producer: () => producerStub, consumer: consumerStub, admin: adminStub };
    kafkaStub = mock.fn(() => kafkaStubReturn);

    delete require.cache[require.resolve('../../../src/initializers/kafka/kafka')];
    mock.module('kafkajs', {
      namedExports: { Kafka: kafkaStub, Partitioners }
    });
    ({ default: Kafka } = await import('../../../src/initializers/kafka/kafka'));
  });

  afterEach(function () {
    mock.restoreAll();
  });

  describe('connect', function () {
    describe('with certificates', function () {
      it('should call correct methods with correct args', async () => {
        const kafka = new Kafka({
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
        assert.strictEqual(producerStub.connect.mock.calls.length, 1);

        assertContainsDeep(getMockCallArgs(kafkaStub), [
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

    describe('without headers', function () {
      it('should call correct methods with correct args', async () => {
        const kafka = new Kafka({
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
        assert.strictEqual(producerStub.connect.mock.calls.length, 1);

        assertContainsDeep(getMockCallArgs(kafkaStub), [
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

    describe('with ssl', function () {
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
          },
          connectionTimeout: 5000,
          authenticationTimeout: 10000
        });
        const producerConfig = { maxInFlightRequests: 10 };
        const producerSpy = mock.fn(() => producerStub);
        kafkaStubReturn.producer = producerSpy;
        await kafka.connect(producerConfig);
        assert.strictEqual(producerStub.connect.mock.calls.length, 1);

        assert.deepStrictEqual(getMockCallArgs(producerSpy), [[producerConfig]]);
        assertContainsDeep(getMockCallArgs(kafkaStub), [
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
    describe('with certificates', function () {
      it('should call correct methods with correct args', async () => {
        const kafka = new Kafka({
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
        assert.deepStrictEqual(getMockCallArgs(consumerStub), [[{ groupId: 'groupId' }]]);
        assertContainsDeep(getMockCallArgs(kafkaStub), [
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

    describe('with ssl', function () {
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
          ssl: true,
          connectionTimeout: 5000,
          authenticationTimeout: 10000
        });
        await kafka.createConsumer({ groupId: 'foo' });
        assert.deepStrictEqual(getMockCallArgs(consumerStub), [[{ groupId: 'foo' }]]);

        assertContainsDeep(getMockCallArgs(kafkaStub), [
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
    describe('with certificates', function () {
      it('should call correct methods with correct args', async () => {
        const kafka = new Kafka({
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
        assert.deepStrictEqual(getMockCallArgs(adminStub), [[]]);
        assertContainsDeep(getMockCallArgs(kafkaStub), [
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

    describe('with ssl', function () {
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
          ssl: true,
          connectionTimeout: 5000,
          authenticationTimeout: 10000
        });
        await kafka.connectAdmin();
        assert.deepStrictEqual(getMockCallArgs(adminStub), [[]]);

        assertContainsDeep(getMockCallArgs(kafkaStub), [
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
      assert.deepStrictEqual(getMockCallArgs(adminStub), [[]]);
      assert.deepStrictEqual(getMockCallArgs(fetchTopicMetadataStub), [[]]);
      assert.strictEqual(response, 'metadata');
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
      assert.deepStrictEqual(getMockCallArgs(adminStub), [[]]);
      assert.deepStrictEqual(getMockCallArgs(createTopicsStub), [
        [{ topics: [{ numPartitions: 10, replicationFactor: 1, topic: 'foo' }] }],
        [{ topics: [{ numPartitions: 10, replicationFactor: 1, topic: 'bar' }] }],
        [{ topics: [{ numPartitions: 10, replicationFactor: 1, topic: 'test' }] }]
      ]);
      assert.deepStrictEqual(response, [{ foo: true }, { bar: false }, { test: false }]);
    });

    it('creates topics that do not exist', async function () {
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
      listTopicsStub.mock.mockImplementation(async () => ['foo', 'test']);
      const response = await kafka.createTopics([
        { topic: 'foo', numPartitions: 10, replicationFactor: 1 },
        { topic: 'bar', numPartitions: 10, replicationFactor: 1 },
        { topic: 'test', numPartitions: 10, replicationFactor: 1 }
      ]);
      assert.deepStrictEqual(getMockCallArgs(adminStub), [[]]);
      assert.deepStrictEqual(getMockCallArgs(createTopicsStub), [[{ topics: [{ numPartitions: 10, replicationFactor: 1, topic: 'bar' }] }]]);
      assert.deepStrictEqual(response, [{ bar: true }]);
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

      let callCount = 0;
      fetchOffsetsStub.mock.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return [{ topic: 'topic', partitions: [{ partition: 0, offset: '-1' }] }];
        } else if (callCount === 2) {
          return [{ topic: 'topic2', partitions: [{ partition: 0, offset: '5' }] }];
        } else if (callCount === 3) {
          return [{ topic: 'topic3', partitions: [{ partition: 0, offset: '-1' }] }];
        } else if (callCount === 4) {
          return [
            {
              partitions: [
                { partition: 0, offset: '3' },
                { partition: 1, offset: '-1' }
              ]
            }
          ];
        } else {
          return [{ partitions: [{ partition: 0, offset: '-1' }] }];
        }
      });

      const response = await kafka.renameGroupId([
        { groupId: 'newGroupId', topic: 'topic', oldGroupId: 'oldGroupId' },
        { groupId: 'newGroupId2', topic: 'topic2', oldGroupId: 'oldGroupId2' },
        { groupId: 'newGroupId3', topic: 'topic3', oldGroupId: 'oldGroupId3' }
      ]);

      assert.deepStrictEqual(getMockCallArgs(adminStub), [[]]);
      assert.deepStrictEqual(getMockCallArgs(fetchOffsetsStub), [
        [{ groupId: 'newGroupId', topics: ['topic'], resolveOffsets: false }],
        [{ groupId: 'newGroupId2', topics: ['topic2'], resolveOffsets: false }],
        [{ groupId: 'newGroupId3', topics: ['topic3'], resolveOffsets: false }],
        [{ groupId: 'oldGroupId', topics: ['topic'], resolveOffsets: false }],
        [{ groupId: 'oldGroupId3', topics: ['topic3'], resolveOffsets: false }]
      ]);
      assert.deepStrictEqual(getMockCallArgs(setOffsetsStub), [
        [{ groupId: 'newGroupId', partitions: [{ offset: '3', partition: 0 }], topic: 'topic' }]
      ]);
      assert.deepStrictEqual(response, [
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
});
