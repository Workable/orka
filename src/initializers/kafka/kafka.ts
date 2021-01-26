import { getLogger } from '../log4js';
import requireInjected from '../../require-injected';
import { KafkaConfig } from '../../typings/kafka';
import type * as KafkajsType from 'kafkajs';
import { flatten } from 'lodash';
import * as uuid from 'uuid';

const { Kafka }: typeof KafkajsType = requireInjected('kafkajs');
const logger = getLogger('orka.kafka');

export default class OrkaKafka {
  private options: KafkaConfig;
  public consumeClient: KafkajsType.Kafka;
  public produceClient: KafkajsType.Kafka;
  public producer: KafkajsType.Producer;

  constructor(options: KafkaConfig) {
    this.options = options;
  }

  public async connect() {
    const { brokers, producer, clientId } = this.options;

    this.produceClient = new Kafka({
      brokers: producer.brokers,
      clientId,
      logCreator: (level: number) => entry => {
        getLogger('orka.kafka.consumer')[entry.label.toLowerCase()](entry.log);
      },
      ...getAuthOptions(producer)
    });

    this.producer = this.produceClient.producer();
    await this.producer.connect();

    logger.info(`Kafka connected ${producer?.brokers?.join(', ') || brokers.join(', ')}`);
  }

  public async createConsumer({ groupId, ...rest }: KafkajsType.ConsumerConfig = {} as any) {
    groupId ??= this.options.groupId;
    const { brokers, clientId } = this.options;
    this.consumeClient = new Kafka({
      brokers,
      clientId,
      logCreator: (level: number) => entry => {
        getLogger('orka.kafka.consumer')[entry.label.toLowerCase()](entry.log);
      },
      ...getAuthOptions(this.options)
    });
    const consumer = this.consumeClient.consumer({ groupId, ...rest });
    await consumer.connect();
    logger.info(`Kafka consumer(${groupId}) connected ${brokers.join(', ')}`);
    return consumer;
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
    const headers = inputHeaders.reduce((m, h) => ({ ...m, ...h }), {});
    const [recordMetadata] = await this.producer.send({
      topic,
      messages: [{ key, value: message, headers, partition }]
    });

    console.log(JSON.stringify(recordMetadata));
    logger.info(
      `partition(${recordMetadata.partition}).offset(${recordMetadata.baseOffset}).key(${key}) produced for topic ${topic}`
    );
    return recordMetadata;
  }
}

function getAuthOptions(options: {
  certificates?: KafkaConfig['certificates'];
  ssl?: KafkaConfig['ssl'];
  sasl?: KafkaConfig['sasl'];
}) {
  const { key, cert, ca } = options.certificates;
  if (key && cert && ca) return { ssl: { ...options.certificates, ca: flatten([ca]) } };

  const { username, password } = options.sasl;
  if (username && password) return { sasl: options.sasl, ssl: options.ssl };
}
