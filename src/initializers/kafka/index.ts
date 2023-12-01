import { isEmpty } from 'lodash';
import { KafkaConfig } from '../../typings/kafka';
import Kafka from './kafka';
import type * as KafkajsType from 'kafkajs';
import { appendHeadersFromStore } from '../../utils';
import { getRequestContext } from '../../builder';
import { getLogger } from '../log4js';

let logger: ReturnType<typeof getLogger>;
export {
  BaseKafkaHandler,
  BaseKafkaBatchHandler,
  BaseKafkaHandlerMessage,
  BaseKafkaHandlerOptions,
  BaseKafkaHandlerBatch
} from './base-kafka-handler';

let kafka: Kafka;
export default async (
  config: { kafka: KafkaConfig; traceHeaderName: string },
  kafkaProducer?: KafkajsType.ProducerConfig
) => {
  logger = getLogger('orka.kafka');
  const kafkaConfig = config.kafka;
  if (!isEmpty(kafkaConfig && kafkaConfig.brokers)) {
    const Kafka = (await import('./kafka')).default;

    kafka = new Kafka(kafkaConfig);
    await kafka.connect(kafkaProducer);

    updateSend(kafka, config);
  }
};

function updateSend(kafka: Kafka, config: { traceHeaderName: string }) {
  const originalSend = kafka.producer.send;
  kafka.producer.send = async function send(record) {
    record.messages.forEach(message => {
      const traceHeaderName = config.traceHeaderName.toLowerCase();
      appendHeadersFromStore(message, getRequestContext(), config);
      if (!message.key && message.headers[traceHeaderName]) {
        message.key = message.headers[traceHeaderName];
      }
    });
    const sent: KafkajsType.RecordMetadata[] = await originalSend.call(this, record);
    sent.map((recordMetadata, i) =>
      logger.debug(
        `partition(${recordMetadata.partition}).offset(${recordMetadata.baseOffset}).key(${record.messages[i].key}) produced for topic ${recordMetadata.topicName}`
      )
    );
    return sent;
  };
}

export const getKafka = () => {
  if (!kafka) {
    throw new Error('kafka is not initialized');
  }
  return kafka;
};

export const disconnectProducer = async () => {
  if (!kafka) return;
  await kafka.disconnect();
};

export const isHealthy = () => {
  if (!kafka) return;
  return kafka.isHealthy();
};
