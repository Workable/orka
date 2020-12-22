import { getLogger } from '../log4js';
import { snakeCase } from 'lodash';
import Prometheus from './prometheus';

let instance: Prometheus;

const logger = getLogger('orka.initializers.prometheus');

export default async (config, appName: string) => {
  if (!config.prometheus?.enabled) {
    return;
  }
  const app = snakeCase(appName);
  const Prometheus = (await import('./prometheus')).default;
  instance = new Prometheus(app, config.prometheus);
  logger.info(`Prometheus initialized with application name: ${app}`);
};

export const getPrometheus = (): Prometheus => {
  if (!instance) {
    logger.error(new Error('prometheus is not initialized'));
  }
  return instance;
};
