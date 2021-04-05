import { isEmpty } from 'lodash';
import { KafkaConfig } from '../../typings/kafka';
import Kafka from './kafka';
import type * as KafkajsType from 'kafkajs';

export { default as BaseKafkaHandler } from './base-kafka-handler';

let kafka: Kafka;
export default async (kafkaConfig: KafkaConfig, kafkaProducer?: KafkajsType.ProducerConfig) => {
  if (!isEmpty(kafkaConfig && kafkaConfig.brokers)) {
    const Kafka = (await import('./kafka')).default;

    kafka = new Kafka(kafkaConfig);
    await kafka.connect(kafkaProducer);
  }
};

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
