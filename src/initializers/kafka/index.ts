import { isEmpty } from 'lodash';
import { KafkaConfig } from '../../typings/kafka';

export { default as BaseKafkaHandler } from './base-kafka-handler';

let kafka;
export default async (kafkaConfig: KafkaConfig) => {
  if (!isEmpty(kafkaConfig && kafkaConfig.brokers)) {
    const Kafka = (await import('./kafka')).default;

    kafka = new Kafka(kafkaConfig);
    await kafka.connect();
  }
};

export const getKafka = () => {
  if (!kafka) {
    throw new Error('kafka is not initialized');
  }
  return kafka;
};
