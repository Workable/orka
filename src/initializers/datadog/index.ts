import requireInjected from '../../require-injected';
import { getLogger } from '../log4js';

let tracer;
export default config => {
  if (isDatadogEnabled()) {
    tracer = requireInjected('dd-trace').init();
    tracer.use('koa', {
      blacklist: config?.datadog?.blacklistedPaths,
      blocklist: config?.datadog?.blacklistedPaths,
      ...config.datadog
    });
  }
};

export const getDatadogTracer = () => {
  if (!tracer) {
    getLogger('orka.initializers.datadog').error(new Error('Datadog tracer required before initialized.'));
  }
  return tracer;
};

export const isDatadogEnabled = () => {
  return process.env.DD_SERVICE && process.env.DD_ENV;
};

let formats;
export const injectTrace = (event: any) => {
  if (!isDatadogEnabled()) return;
  formats = formats ?? requireInjected('dd-trace/ext').formats;
  const span = tracer?.scope()?.active();
  if (span) {
    tracer.inject(span.context(), formats.LOG, event);
  }
};
