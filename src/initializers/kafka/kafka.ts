import { getLogger } from '../log4js';
import authOptions from './auth-options';
import requireInjected from '../../require-injected';
import { NProducer, KafkaConfig } from '../../typings/kafka';

const { NConsumer: KafkaConsumer, NProducer: KafkaProducer } = requireInjected('sinek');

export default class Kafka {
  private producer: NProducer;
  private options: KafkaConfig;
  private authOptions: any;

  constructor(options: KafkaConfig) {
    this.options = options;
  }

  public async connect() {
    const { certificates = {}, sasl = {}, brokers, producer } = this.options;
    const authInput = { ...certificates, ...sasl };
    this.authOptions = authOptions(authInput);
    this.producer = this.createProducer();
    const logger = getLogger('orka.kafka.connect');
    this.producer.on('error', err => logger.error(err));
    await this.producer.connect();
    logger.info(`Kafka producer connected ${producer?.brokers?.join(', ') || brokers.join(', ')}`);
  }

  public async send(
    topic: string,
    message: string | Buffer,
    key?: string,
    partition?: number,
    headers?: { [key: string]: string }[]
  ) {
    const { key: _key, partition: _partition, offset } = await this.producer.send(
      topic,
      message,
      partition,
      key,
      null,
      headers
    );
    getLogger('orka.kafka.send').info(`partition(${_partition})[${offset}][${_key}] produced for topic ${topic}`);
  }

  public createConsumer(topic: string | string[], autoOffsetReset?: 'earliest' | 'latest') {
    const { groupId, brokers } = this.options;
    const config = {
      groupId,
      logger: getLogger('orka.kafka.consumer.internal'),
      noptions: {
        'group.id': groupId,
        'metadata.broker.list': brokers.join(','),
        'socket.keepalive.enable': true,
        'api.version.request': true,
        'socket.blocking.max.ms': 100,
        'log.connection.close': false,
        ...this.authOptions
      },
      tconf: {
        'auto.offset.reset': autoOffsetReset || <'earliest'>'earliest'
      }
    };

    return new KafkaConsumer(topic, config);
  }

  public createProducer() {
    const { clientId, producer } = this.options;
    const producerAuthOptions = authOptions({
      key: producer.certificates?.key,
      cert: producer.certificates?.cert,
      ca: producer.certificates?.ca,
      username: producer.sasl?.username,
      password: producer.sasl?.password
    });
    const config = {
      logger: getLogger('orka.kafka.producer.internal'),
      noptions: {
        'metadata.broker.list': producer.brokers.join(','),
        'client.id': clientId,
        'socket.keepalive.enable': true,
        'api.version.request': true,
        'queue.buffering.max.ms': 1000,
        'log.connection.close': false,
        ...producerAuthOptions
      },
      tconf: {
        'request.required.acks': 1
      }
    };
    return new KafkaProducer(config, undefined, /* defaultPartitionCount */ 'auto');
  }
}
