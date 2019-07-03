import { isEmpty } from 'lodash';
import { default as Kafka } from './kafka';
export { default as BaseKafkaHandler } from './base-kafka-handler';

let kafka;
export default async config => {
  if (!isEmpty(config.kafka.brokers)) {
    kafka = new Kafka(config.kafka);
    await kafka.connect();
  }
};

export const getKafka = () => kafka;
