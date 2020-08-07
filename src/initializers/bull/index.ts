import { isEmpty } from 'lodash';
import { parseURL } from 'ioredis/built/utils';
import { OrkaOptions } from '../../typings/orka';

let bull, ready;

export default async (config, orkaOptions: Partial<OrkaOptions>) => {
  if (!config.bull || !config.bull.queue?.queues || (!config.bull.redis?.url && !config.redis?.url)) {
    return;
  }
  bull = await import('./bull');
  const prefix = orkaOptions.appName;
  const defaultOptions = config.bull.queue.options;
  const redis = config.bull.redis || config.redis;

  if (config.bull.redis?.tls) {
    ['key', 'ca', 'cert'].forEach(prop => {
      if (isEmpty(config.bull.redis.tls[prop])) delete config.bull.redis.tls[prop];
    });
    if (isEmpty(config.bull.redis.tls)) delete config.bull.redis.tls;
  }
  const redisOpts = {
    ...parseURL(redis.url),
    tls: redis.tls,
    enableReadyCheck: false
  };
  // Initialize all queues
  config.bull.queue.queues.forEach(queue => bull.createQueue(prefix, queue, defaultOptions, redisOpts));
  ready = true;
};

const redinessCheck = () => {
  if (!ready) {
    throw new Error('bull is not initialized');
  }
};

export const getQueue = (name: string) => {
  redinessCheck();
  return bull.getQueue(name);
};

export const getStats = (): Promise<{ queue: string; count: number; failed: number }[]> => {
  redinessCheck();
  return bull.getStats();
};

export const queueMetrics = async cronExpression => {
  redinessCheck();
  const metrics = (await import('./metrics')).default;
  metrics(cronExpression);
};
