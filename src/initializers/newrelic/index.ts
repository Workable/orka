import { OrkaOptions } from '../../typings/orka';
import requireInjected from '../../require-injected';

let newrelic;
export default async (config, orkaOptions: Partial<OrkaOptions>) => {
  process.env.NEW_RELIC_HOME = __dirname;
  if (config.newRelicLicenseKey) {
    process.env.NEW_RELIC_APP_NAME = `${orkaOptions.appName} ${config.nodeEnv}`;
    newrelic = requireInjected('newrelic');
  }
};

export const getNewRelic = () => newrelic;
