import Kafka from './kafka';
import { getLogger, Logger } from 'log4js';
import { flatten } from 'lodash';
import type * as KafkajsType from 'kafkajs';

export default abstract class BaseKafkaHandler<Input, Output> {
  consumer: KafkajsType.Consumer;
  topic: string | string[];
  logger: Logger;
  fromBeggining: boolean;
  partitionsConsumedConcurrently: number;
  runOptions: KafkajsType.ConsumerRunConfig;
  jsonParseValue: boolean;
  stringifyHeaders: boolean;

  constructor(
    kafka: Kafka,
    options: {
      topic: string | string[];
      logger: Logger;
      fromBeggining?: boolean;
      autoOffsetReset?: 'earliest' | 'latest';
      consumerOptions: KafkajsType.ConsumerConfig;
      runOptions: KafkajsType.ConsumerRunConfig;
      jsonParseValue: boolean;
      stringifyHeaders: boolean;
    }
  ) {
    const { topic, logger, autoOffsetReset, fromBeggining } = options;
    if (autoOffsetReset) {
      this.fromBeggining = autoOffsetReset === 'earliest';
    } else {
      this.fromBeggining = fromBeggining;
    }

    this.topic = topic;
    this.jsonParseValue = options.jsonParseValue ?? true;
    this.stringifyHeaders = options.stringifyHeaders ?? true;
    this.runOptions = options.runOptions;
    this.logger = logger || getLogger(`kafka.consumer.${this.topic}`);
    kafka.createConsumer(options.consumerOptions).then(c => {
      this.consumer = c;
      this.logger.info(`Kafka consumer connected to topic: ${this.topic}`);
      this.consume().catch(err => this.logger.error(err));
    });
  }

  abstract handle(msg: KafkajsType.KafkaMessage & { value: Input }): Promise<Output>;

  async consume() {
    this.logger.info(`[${this.topic}] Consuming...`);
    await Promise.all(
      flatten([this.topic]).map(topic => this.consumer.subscribe({ topic, fromBeginning: this.fromBeggining }))
    );
    await this.consumer.run({
      ...this.runOptions,
      eachMessage: (async ({
        topic,
        partition,
        message
      }: {
        message: KafkajsType.KafkaMessage & {
          value: Input;
          rawValue: Buffer;
          rawHeaders: KafkajsType.IHeaders;
          topic: string;
          partition: number;
        };
        partition: number;
        topic: string;
      }) => {
        message.topic = topic;
        message.partition = partition;
        if (this.jsonParseValue) {
          try {
            message.rawValue = message.value;
            message.value = JSON.parse(message.value.toString());
          } catch (e) {
            this.logger.error(e);
          }
        }
        if (this.stringifyHeaders) {
          message.rawHeaders = message.headers;
          message.headers = Object.keys(message.headers).reduce(
            (m, k) => ({ ...m, [k]: message.headers[k].toString() }),
            {}
          );
        }
        await this.handle(message);
      }) as any
    });
  }
}
