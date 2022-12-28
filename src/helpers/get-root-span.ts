import { getDatadogTracer } from '../initializers/datadog/index';

export default function getRootSpan(ctx) {
  let ddSpan = ctx.req?._datadog?.span;
  if (!ddSpan) {
    const activeSpan = getDatadogTracer()?.scope()?.active();
    if (activeSpan?.context()?._trace?.started.length > 0) ddSpan = activeSpan?.context()?._trace?.started[0];
  }
  return ddSpan;
}
