import { createClient as createClientType, RedisClient as RedisClientType } from 'redis';
import { getLogger } from './log4js';
import { isEmpty, cloneDeep } from 'lodash';

const logger = getLogger('services.redisService');

function getRedisUrl(config) {
  return config && config.url;
}

function getHost(url) {
  return url.split('@')[1] || url;
}

const exhaustError = new Error('Retry retry_strategy options.total_retry_time exhausted');
let firstClient: RedisClientType;

export function createRedisConnection(config) {
  const { createClient }: { createClient: typeof createClientType } = require('redis');
  config = cloneDeep(config);
  const redisUrl = getRedisUrl(config);
  if (!redisUrl) return;

  if (config.options?.tls) {
    if (isEmpty(config.options.tls.ca)) delete config.options.tls.ca;
    if (isEmpty(config.options.tls.cert)) delete config.options.tls.cert;
    if (isEmpty(config.options.tls.key)) delete config.options.tls.key;
    if (isEmpty(config.options.tls)) delete config.options.tls;
  }

  const options = {
    timesConnected: 10,
    totalRetryTime: 1000 * 60 * 60,
    reconnectAfterMultiplier: 1000,
    socketKeepalive: true,
    socketInitialDelay: 60000,
    ...config.options
  };

  options.retry_strategy = function(opts) {
    if (opts.error && opts.error.code === 'ECONNREFUSED') logger.error(opts.error);
    if (opts.total_retry_time > options.totalRetryTime) return exhaustError;
    if (opts.times_connected > options.timesConnected) {
      const msg =
        'redis error retry_strategy options.times_connected exhausted.' +
        'Please verify that the redis-server "timeout" config is large enough or disabled(0).' +
        'Redis-cli:"config get timeout" ';
      throw new Error(msg);
    }
    return;
  };

  const client = createClient(redisUrl, options);
  if (!firstClient) firstClient = client;
  client.on('connect', () => {
    const socket = client.stream;
    (socket as any).setKeepAlive(options.socketKeepalive, options.socketInitialDelay);
    logger.info(`Redis connected ${getHost(redisUrl)}`);
  });

  client.on('error', e => {
    if (Array.isArray(e.args)) e.args[0] = getHost(redisUrl);
    logger.error(e, `Redis disconnected`);
  });

  return client;
}

export function getRedis() {
  if (!firstClient) throw new Error('Redis is not initialized');
  return firstClient;
}
