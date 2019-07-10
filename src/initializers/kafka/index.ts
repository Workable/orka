import { isEmpty } from 'lodash';
import { default as Kafka } from './kafka';
import { KafkaConfig } from '../../typings/kafka';

export { default as BaseKafkaHandler } from './base-kafka-handler';

let kafka;
export default async (kafkaConfig: KafkaConfig) => {
  if (!isEmpty(kafkaConfig && kafkaConfig.brokers)) {
    kafka = new Kafka(kafkaConfig);
    await kafka.connect();
  }
};

export const getKafka = () => kafka;
