import { OrkaOptions } from '../../typings/orka';
import requirePeer from '../../require-peer';

let newrelic;
export default async (config, orkaOptions: Partial<OrkaOptions>) => {
  if (config.newRelicLicenseKey) {
    process.env.NEW_RELIC_HOME = __dirname;
    process.env.NEW_RELIC_APP_NAME = `${orkaOptions.appName} ${config.nodeEnv}`;
    newrelic = requirePeer('newrelic');
  }
};

export const getNewRelic = () => newrelic;
