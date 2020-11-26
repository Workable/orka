import requireInjected from '../../require-injected';
import { getLogger } from '../log4js';

let tracer;
export default () => {
  if (process.env.DD_SERVICE || process.env.DD_ENV) {
    tracer = requireInjected('dd-trace');
  }
};

export const getDatadogTracer = () => {
  if (!tracer) {
    getLogger('orka.initializers.datadog').error(new Error('Datadog tracer required before initialized.'));
  }
  return tracer;
};
