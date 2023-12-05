import { getDatadogTracer, isDatadogEnabled } from '../initializers/datadog/index';
import { getLogger } from '../initializers/log4js';

export default function getRootSpan(ctx) {
  if (!isDatadogEnabled()) return;

  let ddSpan = ctx.req?._datadog?.span;
  if (!ddSpan) {
    try {
      const activeSpan = getDatadogTracer()?.scope()?.active();
      if (activeSpan?.context()?._trace?.started.length > 0) ddSpan = activeSpan?.context()?._trace?.started[0];
    } catch (e) {
      const logger = getLogger('orka.helpers.get-root-span');
      logger.error(e, 'dd-trace error trying to find root span');
    }
  }
  return ddSpan;
}
