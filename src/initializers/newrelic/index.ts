import {  OrkaOptions } from '../../typings/orka';

export default async (config, orkaOptions: OrkaOptions) => {
  if (config.newRelicLicenseKey) {
    const newrelic = await import('newrelic');
    process.env.NEW_RELIC_HOME = __dirname;
    process.env.NEW_RELIC_APP_NAME = `${orkaOptions.appName} ${config.nodeEnv}`;
  }
};
