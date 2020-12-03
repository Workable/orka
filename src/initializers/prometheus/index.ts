import { getLogger } from '../log4js';
import { snakeCase } from 'lodash';
import Prometheus from './prometheus';

let instance: Prometheus;

const logger = getLogger('orka.initializers.prometheus');

export default async (config, appName: string) => {
  if (!config.prometheus?.enabled) {
    return;
  }
  const prefix = snakeCase(`custom_${appName}`);
  const Prometheus = (await import('./prometheus')).default;
  instance = new Prometheus(prefix, config.prometheus.gatewayUrl);
  logger.info(`Prometheus initialized with prefix: ${prefix}`);
};

export const getPrometheus = (): Prometheus => {
  if (!instance) {
    logger.error(new Error('prometheus is not initialized'));
  }
  return instance;
};
