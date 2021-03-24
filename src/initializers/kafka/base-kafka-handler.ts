import Kafka from './kafka';
import { getLogger, Logger } from 'log4js';
import { flatten } from 'lodash';
import type * as KafkajsType from 'kafkajs';
import { runWithContext } from '../../builder';
import { alsSupported } from '../../utils';

export default abstract class BaseKafkaHandler<Input, Output> {
  consumer: KafkajsType.Consumer;
  topic: string | string[];
  logger: Logger;
  fromBeginning: boolean;
  partitionsConsumedConcurrently: number;
  runOptions: KafkajsType.ConsumerRunConfig;
  jsonParseValue: boolean;
  stringifyHeaders: boolean;

  constructor(
    kafka: Kafka,
    options: {
      topic: string | string[];
      logger?: Logger;
      fromBeginning?: boolean;
      autoOffsetReset?: 'earliest' | 'latest';
      consumerOptions?: KafkajsType.ConsumerConfig;
      runOptions?: KafkajsType.ConsumerRunConfig;
      jsonParseValue?: boolean;
      stringifyHeaders?: boolean;
    }
  ) {
    const { topic, logger, autoOffsetReset, fromBeginning } = options;
    if (autoOffsetReset) {
      this.fromBeginning = autoOffsetReset === 'earliest';
    } else {
      this.fromBeginning = fromBeginning;
    }

    this.topic = topic;
    this.jsonParseValue = options.jsonParseValue ?? true;
    this.stringifyHeaders = options.stringifyHeaders ?? true;
    this.runOptions = options.runOptions;
    this.logger = logger || getLogger(`kafka.consumer.${this.topic}`);
    kafka.createConsumer(options.consumerOptions).then(c => {
      this.consumer = c;

      this.consume()
        .then(() => this.logger.info(`Kafka consumer connected to topic: ${this.topic}`))
        .catch(err => this.logger.error(err));
    });
  }

  abstract handle(msg: KafkajsType.KafkaMessage & { value: Input; topic: string; partition: number }): Promise<Output>;

  async consume() {
    await Promise.all(
      flatten([this.topic]).map(topic => this.consumer.subscribe({ topic, fromBeginning: this.fromBeginning }))
    );
    this.logger.info(`[${this.topic}] Consuming...`);
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
        if (this.jsonParseValue && message.value) {
          try {
            message.rawValue = message.value;
            message.value = JSON.parse(message.value.toString());
          } catch (e) {
            this.logger.error(e);
          }
        }
        if (this.stringifyHeaders && message.headers) {
          message.rawHeaders = message.headers;
          message.headers = Object.keys(message.headers).reduce(
            (m, k) => ({ ...m, [k]: message.headers[k].toString() }),
            {}
          );
        }
        if (alsSupported()) {
          return runWithContext(
            new Map([['correlationId', message.key.toString()]]),
            () => this.handle(message)
          );
        } else {
          return this.handle(message);
        }
      }) as any
    });
  }
}
