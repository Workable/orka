import * as Url from 'url';
import { getLogger } from '../log4js';
import { OrkaOptions } from '../../typings/orka';
import * as RabbitType from 'rabbit-queue';
import type * as amqp from 'amqplib';
import * as lodash from 'lodash';
import { runWithContext } from '../../builder';
import { alsSupported } from '../../utils';
import logMetrics from '../../helpers/log-metrics';

const logger = getLogger('orka.rabbit');

let connection: RabbitType.Rabbit;
let shouldReconnect: Boolean = true;
let healthy: Boolean = true;

export default (config, orkaOptions: Partial<OrkaOptions>) => {
  const { Rabbit, BaseQueueHandler }: typeof RabbitType = require('rabbit-queue');
  if (!config.queue || !config.queue.url) {
    return;
  }
  if (connection) {
    return;
  }
  healthy = false;
  const url = config.queue.frameMax ? `${config.queue.url}?frameMax=${config.queue.frameMax}` : config.queue.url;

  const socketOptions = {
    servername: Url.parse(url).hostname
  };

  connection = new Rabbit(
    url,
    lodash.defaultsDeep(config.queue.options, {
      socketOptions,
      scheduledPublish: true,
      prefetch: config.queue.prefetch,
      prefix: orkaOptions.appName
    })
  );

  connection.on('connected', () => {
    healthy = true;
    orkaOptions.rabbitOnConnected();
    logger.info('Connected to rabbitmq!');
  });

  connection.on('disconnected', (err = new Error('Rabbitmq Disconnected')) => {
    healthy = false;
    if (shouldReconnect) {
      logger.error(err);
      setTimeout(() => connection.reconnect(), config.queue.connectDelay);
    }
  });
  connection.on('log', (component, level, ...args) => getLogger(component)[level](...args));

  const originalTryHandle = BaseQueueHandler.prototype.tryHandle;
  BaseQueueHandler.prototype.tryHandle = async function tryHandle(
    retries,
    msg: amqp.Message,
    ack: (error, reply) => any
  ) {
    if (alsSupported()) {
      return runWithContext(new Map([['correlationId', this.getCorrelationId(msg)]]), () =>
        originalTryHandle.call(this, retries, msg, ack)
      );
    } else {
      return originalTryHandle.call(this, retries, msg, ack);
    }
  };

  BaseQueueHandler.prototype.getTime = function getTime() {
    return logMetrics.start() as any;
  };

  BaseQueueHandler.prototype.logTime = function logTime(startTime: any, correlationId: string) {
    logMetrics.end(startTime, this.queueName, 'queue', correlationId);
  };

  const originalHandleError = BaseQueueHandler.prototype.handleError;
  BaseQueueHandler.prototype.handleError = function handleError(err: any, msg: any) {
    err.action = this.queueName;
    err.component = err.component || 'rabbit-queue';
    err.context = err.context || {};
    err.context.correlationId = this.getCorrelationId(msg);
    originalHandleError.call(this, err, msg);
  };
};

export const getRabbit = () => {
  if (!connection) {
    throw new Error('rabbit is not initialized');
  }
  return connection;
};

export const isHealthy = () => {
  return healthy;
};

export const close = async () => {
  if (connection) {
    logger.info('Closing rabbit connection');
    shouldReconnect = false;
    await connection.close();
    healthy = false;
  }
};
