import requireInjected from '../../require-injected';
import { getLogger } from '../log4js';

let newrelic;
export default (config, appName: string) => {
  process.env.NEW_RELIC_HOME = __dirname;
  if (process.env.NEW_RELIC_LICENSE_KEY) {
    process.env.NEW_RELIC_APP_NAME = config.newRelic.appName || `${appName} ${config.app.env}`;
    newrelic = requireInjected('newrelic');
  }
};

export const getNewRelic = () => {
  if (!newrelic) {
    getLogger('orka.initializers.newrelic').error(new Error('Newrelic required before initialized.'));
  }
  return newrelic;
};
