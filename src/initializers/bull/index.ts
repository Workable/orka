import { isEmpty } from 'lodash';
import { parseURL } from 'ioredis/built/utils';
import { OrkaOptions } from '../../typings/orka';

let bull;

export default async (config, orkaOptions: Partial<OrkaOptions>) => {
  if (!config.bull || !config.bull.queue?.queues || (!config.bull.redis?.url && !config.redis?.url)) {
    return;
  }

  const prefix = orkaOptions.appName;
  const defaultOptions = config.bull.queue.options;
  const redis = config.bull.redis || config.redis;
  const queues = config.bull.queue.queues;

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

  bull = await import('./bull');
  bull.init(prefix, queues, defaultOptions, redisOpts);
};

export const getQueue = (name: string) => {
  return bull.getQueue(name);
};

export const getStats = (): Promise<{ queue: string; count: number; failed: number }[]> => {
  return bull.getStats();
};

export const queueMetrics = async cronExpression => {
  const metrics = (await import('./metrics')).default;
  metrics(cronExpression);
};
