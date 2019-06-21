import { OrkaOptions } from '../../typings/orka';

let newrelic;
export default async (config, orkaOptions: Partial<OrkaOptions>) => {
  if (config.newRelicLicenseKey) {
    process.env.NEW_RELIC_HOME = __dirname;
    process.env.NEW_RELIC_APP_NAME = `${orkaOptions.appName} ${config.nodeEnv}`;
    newrelic = await import('newrelic');
  }
};

export const getNewRelic = () => newrelic;
