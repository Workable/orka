import { getDatadogTracer, isDatadogEnabled } from '../initializers/datadog/index';
import { getLogger } from '../initializers/log4js';

export default function getRootSpan(ctx) {
  if (!isDatadogEnabled()) return;

  let ddSpan = ctx.req?._datadog?.span;
  if (!ddSpan) {
    try {
      const activeSpan = getDatadogTracer()?.scope()?.active();
      const internalTrace = (activeSpan?.context() as any)?._trace;
      if (internalTrace?.started.length > 0) ddSpan = internalTrace?.started[0];
    } catch (e) {
      const logger = getLogger('orka.helpers.get-root-span');
      logger.error(e, 'dd-trace error trying to find root span');
    }
  }
  return ddSpan;
}
