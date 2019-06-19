import { getLogger } from '../log4js';
import { NProducer, NConsumer } from 'sinek';
import authOptions from './auth-options';

export default class Kafka {
  private producer: NProducer;
  private options: any;
  private authOptions: any;

  constructor(options: {
    key: string;
    cert: string;
    ca: string;
    groupId: string;
    clientId: string;
    brokers: string[];
  }) {
    this.options = options;
  }

  public async connect() {
    const { key, cert, ca, brokers } = this.options;
    this.authOptions = key && cert && ca ? authOptions({ key, cert, ca }) : {};
    this.producer = this.createProducer();
    const logger = getLogger('orka.kafka.connect');
    this.producer.on('error', err => logger.error(err));
    await this.producer.connect();
    logger.info(`Kafka connected ${brokers.join(',')}`);
  }

  public async send(topic: string, message: string | Buffer) {
    const { key, partition, offset } = await this.producer.send(topic, message);
    getLogger('orka.kafka.send').info(`partition(${partition})[${offset}][${key}] produced for topic ${topic}`);
  }

  public createConsumer(topic: string) {
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
        ...this.authOptions
      },
      tconf: {
        'auto.offset.reset': <'earliest'>'earliest'
      }
    };

    return new NConsumer(topic, config);
  }

  public createProducer() {
    const { clientId, brokers } = this.options;
    const config = {
      logger: getLogger('orka.kafka.producer.internal'),
      noptions: {
        'metadata.broker.list': brokers.join(','),
        'client.id': clientId,
        'socket.keepalive.enable': true,
        'api.version.request': true,
        'queue.buffering.max.ms': 1000,
        ...this.authOptions
      },
      tconf: {
        'request.required.acks': 1
      }
    };
    return new NProducer(config);
  }
}
