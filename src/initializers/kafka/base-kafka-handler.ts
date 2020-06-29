import Kafka from './kafka';
import { Logger } from 'log4js';
import { flatten } from 'lodash';
import { NConsumer, KafkaMessage } from '../../typings/kafka';

export default abstract class BaseKafkaHandler<Input, Output> {
  consumer: NConsumer;
  topic: string | string[];
  batchSize: number;
  logger: Logger;
  autoOffsetReset: string;

  constructor(
    kafka: Kafka,
    options: { topic: string | string[]; logger: Logger; batchSize?: number; autoOffsetReset?: 'earliest' | 'latest' }
  ) {
    const { topic, batchSize, logger, autoOffsetReset } = options;
    this.topic = topic;
    this.batchSize = batchSize || 1;
    this.autoOffsetReset = autoOffsetReset || 'earliest';
    this.logger = logger;
    this.consumer = kafka.createConsumer(this.topic, <'earliest' | 'latest'>this.autoOffsetReset);
    this.consumer.connect().then(() => {
      this.logger.info(`Kafka consumer connected to topic: ${this.topic}`);
      this.consume().catch(err => this.logger.error(err));
    });
  }

  abstract async handle(msg: KafkaMessage & { value: Input }): Promise<Output>;

  async consume() {
    this.logger.info(`[${this.topic}] Consuming...`);
    this.consumer.consume(
      async (messages: KafkaMessage | KafkaMessage[], cb) => {
        await Promise.all(
          flatten([messages]).map(async msg => {
            await this.handle(msg);
          })
        );
        this.consumer.commit(false); //synchronous commit, must be called before the callback
        cb();
      },
      false,
      true, //Receive as object
      {
        batchSize: this.batchSize,
        noBatchCommits: true, //Commit after every batch (even if num < batchsize)
        manualBatching: true
      }
    );
  }
}
