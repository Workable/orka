import { queuePath } from './helper';
import { getLogger } from '../log4js';

let startedQueues = [];
export async function start(queueName, options) {
  let queue;

  try {
    const Queue = require(queuePath(queueName));
    let queueObj = new Queue(options);
    let queue = queueObj.get();
    startedQueues.push(queue);
    queueObj.process();
    getLogger('queue.cli').info(`Queue started: ${queue.name}`);
  } catch (err) {
    getLogger('queue.cli').error(err.message);
    queue && (await queue.close());
  }

  return queue;
}
