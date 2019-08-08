import * as Url from 'url';
import { getLogger } from '../log4js';
import { OrkaOptions } from '../../typings/orka';
import * as RabbitType from 'rabbit-queue';

const logger = getLogger('orka.rabbit');

let connection: RabbitType.Rabbit;

export default (config, orkaOptions: Partial<OrkaOptions>) => {
  const { Rabbit }: typeof RabbitType = require('rabbit-queue');
  if (!config.queue || !config.queue.url) {
    return;
  }
  if (connection) {
    return;
  }
  const url = config.queue.frameMax ? `${config.queue.url}?frameMax=${config.queue.frameMax}` : config.queue.url;

  const socketOptions = {
    servername: Url.parse(url).hostname
  };

  connection = new Rabbit(url, {
    socketOptions,
    scheduledPublish: true,
    prefetch: config.queue.prefetch,
    prefix: orkaOptions.appName
  });

  connection.on('connected', () => {
    orkaOptions.rabbitOnConnected();
    logger.info('Connected to rabbitmq!');
  });

  connection.on('disconnected', (err = new Error('Rabbitmq Disconnected')) => {
    logger.error(err);
    setTimeout(() => connection.reconnect(), config.queue.connectDelay);
  });
};

export const getRabbit = () => {
  if (!connection) {
    throw new Error('rabbit is not initialized');
  }
  return connection;
};
