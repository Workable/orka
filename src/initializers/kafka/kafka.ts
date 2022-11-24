import { getLogger } from '../log4js';
import requireInjected from '../../require-injected';
import { KafkaConfig } from '../../typings/kafka';
import type * as KafkajsType from 'kafkajs';
import { flatten, isEmpty } from 'lodash';
import * as uuid from 'uuid';

const { Kafka }: typeof KafkajsType = requireInjected('kafkajs');
const logger = getLogger('orka.kafka');

export default class OrkaKafka {
  private options: KafkaConfig;
  private healthy: boolean = true;
  public consumeClient: KafkajsType.Kafka;
  public produceClient: KafkajsType.Kafka;
  public producer: KafkajsType.Producer;

  constructor(options: KafkaConfig) {
    this.options = options;
  }

  public async connect(options?: KafkajsType.ProducerConfig) {
    const { producer, clientId, connectionTimeout, authenticationTimeout } = this.options;
    this.healthy = false;

    this.produceClient = new Kafka({
      brokers: producer.brokers,
      clientId,
      logCreator: (level: number) => entry => {
        const { message, ...extra } = entry.log;
        const level = this.decideLogLevel(message, entry.label.toLowerCase());
        getLogger('orka.kafka.producer')[level](message, extra);
      },
      ...getAuthOptions(producer),
      connectionTimeout,
      authenticationTimeout
    });

    this.producer = this.produceClient.producer(options);

    const { CONNECT, DISCONNECT } = this.producer.events;
    this.producer.on(CONNECT, () => {
      logger.debug(`Producer connected`);
      this.healthy = true;
    });
    this.producer.on(DISCONNECT, () => {
      logger.debug(`Producer disconnected`);
      this.healthy = false;
    });

    await this.producer.connect();

    logger.info(`Kafka connected ${producer?.brokers?.join(', ')}`);
  }

  public async disconnect() {
    if (this.producer) await this.producer.disconnect();
  }

  public isHealthy() {
    return this.healthy;
  }

  public async createConsumer({ groupId, ...rest }: KafkajsType.ConsumerConfig = {} as any) {
    groupId ??= this.options.groupId;
    const { brokers, clientId, connectionTimeout, authenticationTimeout } = this.options;
    this.consumeClient = new Kafka({
      brokers,
      clientId,
      logCreator: (level: number) => entry => {
        const { message, ...extra } = entry.log;
        const level = this.decideLogLevel(message, entry.label.toLowerCase());
        getLogger('orka.kafka.consumer')[level](message, extra);
      },
      ...getAuthOptions(this.options),
      connectionTimeout,
      authenticationTimeout
    });
    const consumer = this.consumeClient.consumer({ groupId, ...rest });
    await consumer.connect();
    logger.info(`Kafka consumer(${groupId}) connected ${brokers.join(', ')}`);
    return consumer;
  }

  public async connectAdmin() {
    const { brokers, clientId, connectionTimeout, authenticationTimeout } = this.options;
    const kafka = new Kafka({
      brokers,
      clientId,
      logCreator: (level: number) => entry => {
        const { message, ...extra } = entry.log;
        if (extra.error === 'Topic with this name already exists') return;
        const level = this.decideLogLevel(message, entry.label.toLowerCase());
        getLogger('orka.kafka.admin')[level](message, extra);
      },
      ...getAuthOptions(this.options),
      connectionTimeout,
      authenticationTimeout
    });
    const admin = kafka.admin();
    await admin.connect();
    logger.info(`Kafka admin connected ${brokers.join(', ')}`);
    return admin;
  }

  public async renameGroupId(groupIds: { groupId: string; topic: string; oldGroupId: string }[]) {
    const admin = await this.connectAdmin();
    const renamings = await Promise.all(
      groupIds
        .map(async ({ groupId, topic, oldGroupId }) => {
          const offsets = await admin.fetchOffsets({ groupId, topic, resolveOffsets: false });
          if (offsets.every(({ offset }) => offset === '-1')) {
            // groupId is not configured
            const oldOffsets = await admin.fetchOffsets({ groupId: oldGroupId, topic, resolveOffsets: false });
            const knownOffsets = oldOffsets?.filter(o => o.offset !== '-1');
            if (!isEmpty(knownOffsets)) await admin.setOffsets({ groupId, topic, partitions: knownOffsets });
            return { groupId, renamedFrom: oldGroupId, topic, oldOffsets: knownOffsets };
          } else {
            return { groupId, renamedFrom: oldGroupId, topic, alreadyDeclared: true };
          }
        })
        .map(promise =>
          promise.catch(e => {
            logger.error(e);
            return e;
          })
        )
    );
    await admin.disconnect();
    logger.info(`Added groupIds with offsets: ${JSON.stringify(renamings)}`);
    return renamings;
  }

  public async metadata() {
    const admin = await this.connectAdmin();
    const metadata = await admin.fetchTopicMetadata();
    admin.disconnect();
    return metadata;
  }

  public async createTopics(topics: KafkajsType.ITopicConfig[]) {
    const admin = await this.connectAdmin();
    const existingTopics = new Set(await admin.listTopics());
    const toBeCreated = topics.filter(t => !existingTopics.has(t.topic));
    if (!toBeCreated?.length) {
      await admin.disconnect();
      logger.info(`Skipping topic creation. Topics already exist.`);
      return;
    }
    const responses = await Promise.all(
      toBeCreated.map(topic =>
        admin
          .createTopics({ topics: [topic] })
          .catch(e => {
            logger.error(e);
            return e;
          })
          .then(response => ({ [topic.topic]: response }))
      )
    );
    await admin.disconnect();
    logger.info(`Created topics: ${JSON.stringify(responses)}`);
    return responses;
  }

  /**
   * @deprecated  use producer.send instead which is native kafkajs send
   */
  public async send(
    topic: string,
    message: string | Buffer,
    key: string = uuid.v4(),
    partition?: number,
    inputHeaders?: { [key: string]: string }[]
  ) {
    if (!key) key = uuid.v4();
    const headers = inputHeaders?.reduce((m, h) => ({ ...m, ...h }), {});
    const [recordMetadata] = await this.producer.send({
      topic,
      messages: [{ key, value: message, headers, partition }]
    });
    logger.debug('Deprecated method. Use getKafka().producer.send instead');
    logger.info(
      `partition(${recordMetadata.partition}).offset(${recordMetadata.baseOffset}).key(${key}) produced for topic ${topic}`
    );
    return recordMetadata;
  }

  private decideLogLevel = (message: string, level: string) => {
    if (this.options.log.errorToWarn.includes(message) && level === 'error') {
      return 'warn';
    }
    return level;
  }
}

function getAuthOptions(options: {
  certificates?: KafkaConfig['certificates'];
  ssl?: KafkaConfig['ssl'];
  sasl?: KafkaConfig['sasl'];
}) {
  const { key, cert, ca } = options.certificates || {};
  if (key && cert && ca) return { ssl: { ...options.certificates, ca: flatten([ca]) } };

  const { username, password } = options.sasl || {};
  if (username && password) return { sasl: options.sasl, ssl: options.ssl };
}
