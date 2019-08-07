import requireInjected from '../../require-injected';
import { getLogger } from '../log4js';

let newrelic;
export default (appName: string) => {
  process.env.NEW_RELIC_HOME = __dirname;
  if (process.env.NEW_RELIC_LICENSE_KEY) {
    process.env.NEW_RELIC_APP_NAME = `${appName} ${process.env.NODE_ENV}`;
    newrelic = requireInjected('newrelic');
  }
};

export const getNewRelic = () => {
  if (!newrelic) {
    getLogger('orka.initializers.newrelic').error(new Error('Newrelic required before initialized.'));
  }
  return newrelic;
};
