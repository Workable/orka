import { getLogger } from '../log4js';
import { getStats } from './bull';
import * as cron from 'node-cron';
import requireInjected from '../../require-injected';

const newrelic = process.env.NEW_RELIC_LICENSE_KEY ? requireInjected('newrelic') : null;

const reportStats = async () => {
  const stats = await getStats();
  stats.forEach(entry => {
    recordMetric(`Bull/Queues/${entry.queue}`, entry.count);
    recordMetric(`Bull/QueuesFailed/${entry.queue}`, entry.failed);
  });
};

const recordMetric = (key: string, value: number) => {
  if (newrelic) {
    newrelic.recordMetric(key, value);
  } else {
    getLogger('bull.metrics').info(`${key}: ${value}`);
  }
};

export default cronExpression => {
  if (!cron.validate(cronExpression)) {
    throw new Error(`Cannot schedule metrics reporting. Invalid cron expression: ${cronExpression}`);
  }
  getLogger('bull.metrics').info(`Scheduled queue metrics reporting with cron: "${cronExpression}"`);
  const output = newrelic ? 'new relic' : 'logs';
  cron.schedule(cronExpression, async () => {
    getLogger('bull.metrics').info(`Sending queue metrics to ${output}`);
    await reportStats();
  });
};
