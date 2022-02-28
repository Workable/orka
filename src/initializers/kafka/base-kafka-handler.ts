import Kafka from './kafka';
import { getLogger, Logger } from 'log4js';
import { flatten } from 'lodash';
import type * as KafkajsType from 'kafkajs';
import { runWithContext } from '../../builder';
import { alsSupported } from '../../utils';
import { logMetrics } from '../../helpers';

export type BaseKafkaHandlerOptions = {
  topic: string | string[];
  logger?: Logger;
  fromBeginning?: boolean;
  autoOffsetReset?: 'earliest' | 'latest';
  consumerOptions?: KafkajsType.ConsumerConfig;
  runOptions?: KafkajsType.ConsumerRunConfig;
  jsonParseValue?: boolean;
  stringifyHeaders?: boolean;
  onConsumerCreated?: (consumer: KafkajsType.Consumer) => any;
};

export type BaseKafkaHandlerMessage<Input> = KafkajsType.KafkaMessage & {
  value: Input;
  rawValue?: Buffer;
  rawHeaders?: KafkajsType.IHeaders;
  topic: string;
  partition: number;
};

export type BaseKafkaHandlerBatch<Input> = KafkajsType.Batch & {
  messages: BaseKafkaHandlerMessage<Input>[];
};

abstract class Base<Input, Output> {
  consumer: KafkajsType.Consumer;
  topic: string | string[];
  logger: Logger;
  fromBeginning: boolean;
  partitionsConsumedConcurrently: number;
  runOptions: KafkajsType.ConsumerRunConfig;
  jsonParseValue: boolean;
  stringifyHeaders: boolean;

  constructor(kafka: Kafka, options: BaseKafkaHandlerOptions) {
    const { topic, logger, autoOffsetReset, fromBeginning, onConsumerCreated } = options;
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
      if (onConsumerCreated) {
        onConsumerCreated(c);
      }
      this.consume()
        .then(() => this.logger.info(`Kafka consumer connected to topic: ${this.topic}`))
        .catch(err => this.logger.error(err));
    });
  }

  parseValue(buffer: Buffer) {
    try {
      return JSON.parse(buffer.toString());
    } catch (e) {
      this.logger.error(e);
    }
    return buffer;
  }

  parseHeaders(headers: KafkajsType.IHeaders) {
    return Object.keys(headers).reduce((m, k) => ({ ...m, [k]: headers[k].toString() }), {});
  }
  transformToKafkaHandlerMessage(
    message: KafkajsType.KafkaMessage,
    topic: string,
    partition: number
  ): BaseKafkaHandlerMessage<Input> {
    return {
      ...message,
      topic,
      partition,
      ...(this.jsonParseValue && message.value
        ? { rawValue: message.value, value: this.parseValue(message.value) }
        : {}),
      ...(this.stringifyHeaders && message.headers
        ? { rawHeaders: message.headers, headers: this.parseHeaders(message.headers) }
        : {})
    };
  }

  abstract run(): Promise<void>;

  async consume() {
    await Promise.all(
      flatten([this.topic]).map(topic => this.consumer.subscribe({ topic, fromBeginning: this.fromBeginning }))
    );
    this.logger.info(`[${this.topic}] Consuming...`);
    await this.run();
  }
}

export abstract class BaseKafkaHandler<Input, Output> extends Base<Input, Output> {
  constructor(kafka: Kafka, options: BaseKafkaHandlerOptions) {
    super(kafka, options);
  }

  async run() {
    await this.consumer.run({
      ...this.runOptions,
      eachMessage: (async ({
        topic,
        partition,
        message
      }: {
        message: BaseKafkaHandlerMessage<Input>;
        partition: number;
        topic: string;
      }) => {
        const start = logMetrics.start();
        let output;
        if (alsSupported()) {
          output = runWithContext(new Map([['correlationId', message.key.toString()]]), () =>
            this.handle(this.transformToKafkaHandlerMessage(message, topic, partition))
          );
        } else {
          output = this.handle(this.transformToKafkaHandlerMessage(message, topic, partition));
        }
        logMetrics.end(start, 'topic-' + topic, 'kafka', message.key.toString());
        return output;
      }) as any
    });
  }

  abstract handle(message: BaseKafkaHandlerMessage<Input>): Promise<Output>;
}

export abstract class BaseKafkaBatchHandler<Input, Output> extends Base<Input, Output> {
  constructor(kafka: Kafka, options: BaseKafkaHandlerOptions) {
    super(kafka, options);
  }

  async run() {
    await this.consumer.run({
      ...this.runOptions,
      eachBatch: async ({ batch, heartbeat }) => {
        const start = logMetrics.start();

        await heartbeat();
        const transformed: BaseKafkaHandlerBatch<Input> = {
          ...batch,
          messages:
            batch?.messages?.map(m => this.transformToKafkaHandlerMessage(m, batch.topic, batch.partition)) || []
        };
        const output = this.handleBatch(transformed);
        logMetrics.end(start, 'topic-' + batch.topic, 'kafka.batch', batch?.partition?.toString());
        return output;
      }
    });
  }

  abstract handleBatch(messages: BaseKafkaHandlerBatch<Input>): Promise<void>;
}
