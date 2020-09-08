import { isEmpty, omit } from 'lodash';
import { getLogger } from '../log4js';
import { OrkaOptions } from '../../typings/orka';

let bull: any;
const logger = getLogger('orka.initializers.bull');

export default async (config, orkaOptions: Partial<OrkaOptions>) => {
  if (!config.bull || !config.bull.queue?.queues || (!config.bull.redis?.url && !config.redis?.url)) {
    return;
  }
  const { parseURL } = await import('ioredis/built/utils');

  const prefix = orkaOptions.appName;
  const defaultOptions = config.bull.queue.options;
  const redis = config.bull.redis || config.redis;
  const options = { enableReadyCheck: false, ...omit(config.bull.redis || config.redis.options, ['url', 'tls']) };
  const queues = config.bull.queue.queues;

  if (config.bull.redis?.tls) {
    ['key', 'ca', 'cert'].forEach(prop => {
      if (isEmpty(config.bull.redis.tls[prop])) delete config.bull.redis.tls[prop];
    });
    if (isEmpty(config.bull.redis.tls)) delete config.bull.redis.tls;
  }

  const redisOpts = {
    ...parseURL(redis.url),
    ...options,
    tls: redis.tls || redis.options?.tls
  };

  const Bull = (await import('./bull')).default;
  bull = new Bull(prefix, queues, defaultOptions, redisOpts);
  logger.info(`Bull initialized with redis: ${redisOpts.host}:${redisOpts.port} (tls: ${!isEmpty(redisOpts.tls)})`);
  logger.info(`Bull configured queues: ${queues.map(q => q.name).join(', ')} (namespace: ${prefix})`);
};

export const getBull = () => {
  if (!bull) {
    throw new Error('bull is not initialized');
  }
  return bull;
};
