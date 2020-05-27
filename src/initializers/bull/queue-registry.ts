import * as Queue from 'bull';
import { getLogger } from 'log4js';
const registry = {};

function getQueue(name, queueOptions = {}): Queue.Queue {
  let queue = registry[name];
  if (!queue) {
    getLogger('queue.base').info(`Initializing Queue: ${name}`);
    queue = new Queue(`assessments:${name}`, queueOptions);
    queue.on('failed', (_job, err) => {
      getLogger(`queue.${name}`).error(err);
    });
    registry[name] = queue;
  }
  return queue;
}

export default { getQueue };
