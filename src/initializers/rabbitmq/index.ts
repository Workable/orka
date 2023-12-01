import * as Url from 'url';
import { getLogger } from '../log4js';
import { OrkaOptions } from '../../typings/orka';
import * as RabbitType from 'rabbit-queue';
import Queue from 'rabbit-queue/js/queue';
import Exchange from 'rabbit-queue/js/exchange';
import * as amqp from 'amqplib';
import * as lodash from 'lodash';
import { runWithContext, getRequestContext } from '../../builder';
import logMetrics from '../../helpers/log-metrics';
import { appendHeadersFromStore, appendToStore } from '../../utils';

let connection: RabbitType.Rabbit;
let shouldReconnect: Boolean = true;
let healthy: Boolean = true;

export default (config, orkaOptions: Partial<OrkaOptions>) => {
  const logger = getLogger('orka.rabbit');
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

  Queue.publish = methodCreator(Queue.publish, 2, config);
  Queue.getReply = methodCreator(Queue.getReply, 2, config);
  Exchange.publish = methodCreator(Exchange.publish, 5, config);
  Exchange.getReply = methodCreator(Exchange.getReply, 5, config);

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
    const store = new Map([['correlationId', this.getCorrelationId(msg)]]);
    return runWithContext(store, () => {
      appendToStore(store, msg?.properties, config);
      return originalTryHandle.call(this, retries, msg, ack);
    });
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
    const logger = getLogger('orka.rabbit');
    logger.info('Closing rabbit connection');
    shouldReconnect = false;
    await connection.close();
    healthy = false;
  }
};

function methodCreator(originalSendToQueue, propertiesArgIndex, config) {
  return function method(...args: any) {
    let properties = args[propertiesArgIndex - 1];
    if (!properties) {
      properties = {};
      args[propertiesArgIndex - 1] = properties;
    }

    const traceHeaderName = config.traceHeaderName.toLowerCase();
    appendHeadersFromStore(properties, getRequestContext(), config);

    if (!properties.correlationId && properties.headers && properties.headers[traceHeaderName]) {
      properties.correlationId = properties.headers[traceHeaderName];
    }

    return originalSendToQueue.call(this, ...args);
  };
}
