import { list, queuePath } from './helper';
import { getLogger } from '../log4js';
import { getNewRelic } from '../newrelic';

export async function getStats(config): Promise<any> {
  const queueList = await list(config);
  const stats = {};

  for (const queueName of queueList) {
    const Queue = require(queuePath(queueName));
    let queueObj = new Queue();
    let queue = queueObj.get();
    const queueCount = await queue.count();
    const queueFailedCount = await queue.getFailedCount();

    stats[queueName] = {
      queueCount,
      queueFailedCount,
    };
  }
  return stats;
}

export async function reportStats(config): Promise<void> {
  const stats = await getStats(config);

  // tslint:disable-next-line: forin
  for (const queueName in stats) {
    const newrelic = getNewRelic();
    newrelic.recordMetric(
      `Bull/Queues/${queueName}`,
      stats[queueName].queueCount
    );
    newrelic.recordMetric(
      `Bull/QueuesFailed/${queueName}`,
      stats[queueName].queueFailedCount
    );

    getLogger('queue.cli').debug(
      `Reported Bull/Queues/${queueName} ${JSON.stringify(stats[queueName])}`
    );
  }
}
