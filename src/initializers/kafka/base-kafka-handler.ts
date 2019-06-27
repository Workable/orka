import { KafkaMessage, NConsumer } from 'sinek';
import Kafka from './kafka';
import { Logger } from 'log4js';
import { flatten } from 'lodash';

export default abstract class BaseKafkaHandler {
  consumer: NConsumer;
  topic: string;
  batchSize: number;
  logger: Logger;

  constructor(kafka: Kafka, options: { topic: string; logger: Logger; batchSize?: number; }) {
    const { topic, batchSize, logger } = options;
    this.topic = topic;
    this.batchSize = batchSize || 1;
    this.logger = logger;
    this.consumer = kafka.createConsumer(this.topic);
    this.consumer.connect().then(() => {
      this.logger.info(`Kafka consumer connected to topic: ${this.topic}`);
      this.consume().catch(err => this.logger.error(err));
    });
  }

  async abstract handle(message: any): Promise<any>;

  async consume() {
    this.logger.info(`[${this.topic}] Consuming...`);
    this.consumer.consume(
      async (messages: KafkaMessage | KafkaMessage[], cb) => {
        try {
          await Promise.all(flatten([messages]).map(m => this.handle(m)));
          cb();
          this.consumer.commit(false); //synchronous commit
        } catch (err) {
          this.logger.error(`Failed to dequeue`, err);
        }
      },
      false,
      true, //Receive as object
      {
        batchSize: this.batchSize,
        noBatchCommits: true //Commit after every batch (even if num < batchsize)
      }
    );
  }
}
