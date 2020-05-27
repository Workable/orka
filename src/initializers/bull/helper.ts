import * as path from 'path';

export function queuePath(queueName: string): string {
  return path.join(__dirname, '..', queueName);
}

export async function list(config): Promise<string[]> {
  let queueNames = [];
  if (config.bull.queues) {
    queueNames = config.bull.queues.map((q) => q.name);
  }
  return queueNames;
}

export function decode(ser): any {
  return ser && JSON.parse(Buffer.from(ser, 'base64').toString());
}
