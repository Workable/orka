import type { createClient as createClientType, RedisClientType } from 'redis';
import { getLogger } from './log4js';
import { isEmpty, cloneDeep } from 'lodash';

const logger = getLogger('services.redisService');

export type OrkaRedisClient = RedisClientType;

function getRedisUrl(config) {
  return config && config.url;
}

function getHost(url) {
  return url.split('@')[1] || url;
}

function isConnectionRefused(cause) {
  if (!cause) return false;
  if (cause.code === 'ECONNREFUSED') return true;
  return Array.isArray(cause.errors) && cause.errors.some(e => e?.code === 'ECONNREFUSED');
}

let firstClient: OrkaRedisClient;

export async function createRedisConnection(config) {
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

  const {
    timesConnected = 10,
    totalRetryTime = 1000 * 60 * 60,
    reconnectAfterMultiplier = 1000,
    socketKeepalive = true,
    socketInitialDelay = 60000,
    tls,
    socket: socketOptions,
    ...clientOptions
  } = config.options ?? {};

  let timesConnectedCounter = 0;
  let firstRetryAt: number;

  // Preserves the semantics of the v3 retry_strategy: give up on refused connections,
  // on exhausted total retry time, and after too many reconnections (the health check
  // then reports unhealthy so the orchestrator can restart the service).
  const reconnectStrategy = (retries: number, cause: Error): number | Error => {
    logger.error(`Retrying to connect to Redis (retries: ${retries})`, cause);
    if (isConnectionRefused(cause)) return new Error('The server refused the connection');
    if (firstRetryAt === undefined) firstRetryAt = Date.now();
    if (Date.now() - firstRetryAt > totalRetryTime) return new Error('Retry time exhausted');
    if (timesConnectedCounter > timesConnected) {
      return new Error(
        'redis error reconnectStrategy timesConnected exhausted.' +
          'Please verify that the redis-server "timeout" config is large enough or disabled(0).' +
          'Redis-cli:"config get timeout" '
      );
    }
    const retryInMS = Math.pow(2, retries + 1) * reconnectAfterMultiplier;
    logger.info(`Retrying to connect to redis in ${retryInMS}ms`);
    return retryInMS;
  };

  const client = createClient({
    url: redisUrl,
    RESP: 2,
    ...clientOptions,
    socket: {
      keepAlive: socketKeepalive,
      keepAliveInitialDelay: socketInitialDelay,
      reconnectStrategy,
      ...(tls ? { tls: true, ...tls } : {}),
      ...socketOptions
    }
  });
  if (!firstClient) firstClient = client;

  client.on('ready', () => {
    timesConnectedCounter++;
    firstRetryAt = undefined;
    logger.info(`Redis connected ${getHost(redisUrl)}`);
  });

  client.on('error', e => {
    logger.error(e, `Redis disconnected ${getHost(redisUrl)}`);
  });

  // Awaited during orka boot so the client is ready before the server starts listening.
  // A failed connection is only logged: the app still boots and /health reports unhealthy.
  await client.connect().catch(e => logger.error(e, `Redis connection failed ${getHost(redisUrl)}`));

  return client;
}

export function getRedis() {
  if (!firstClient) throw new Error('Redis is not initialized');
  return firstClient;
}

export const isHealthy = () => {
  if (!firstClient) return false;
  return firstClient.isReady;
};
