import { list, decode } from './helper';
import { start } from './bull';
import { getStats, reportStats } from './metrics';
import { parseURL } from 'ioredis/built/utils';
import defaults = require('lodash/defaults');
import { getLogger } from '../log4js';
import * as cron from 'node-cron';

export default async (config) => {
  const redisUrl = config.bull.redis.url || config.redis.url;

  if (!config.bull && !redisUrl) {
    return;
  }
  const defaultQueueOptions = {
    redis: {
      ...parseURL(redisUrl),
      tls: decode(config.bull.redis.options.tls),
    },
    defaultJobOptions: {
      removeOnComplete: true,
    },
  };
  await startAll(config, defaultQueueOptions);
};

export const startAll = async (config, defaultQueueOptions): Promise<any> => {
  const queues = await list(config);
  for (const queueName of queues) {
    const queueOptions = config.bull.queues.find((q) => q.name === queueName)
      .options;
    const opts = defaults({}, queueOptions, defaultQueueOptions);
    await start(queueName, opts);
  }
};

export const printStats = async (config) => {
  const stats = await getStats(config);
  console.log(stats);
};

export const reportMetrics = (config): any => {
  if (config.newRelicStatsCronExpression) {
    cron.schedule(config.newRelicStatsCronExpression, async () => {
      getLogger('queue.cli').info('Sending queue stats in new relic');
      await reportStats(config);
    });
  } else {
    getLogger('queue.cli').info(
      'Could not send queue stats in new relic since no cron expression exists.'
    );
  }
};
