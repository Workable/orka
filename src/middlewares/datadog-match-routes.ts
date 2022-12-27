import { Context } from 'koa';
import { getDatadogTracer } from './../initializers/datadog/index';

export default async function matchedRoute(ctx: Context, next: () => Promise<void>) {
  if (ctx._matchedRoute) {
    // const ddSpan = ctx.req?._datadog?.span;
    const span = getDatadogTracer().scope().active();
    let ddSpan;
    if (span) ddSpan = span.context()._trace.started[0];

    if (ddSpan) {
      ddSpan.setTag('resource.name', `${ctx.request.method} ${ctx._matchedRoute}`);
      ddSpan.setTag('matchedRoute', ctx._matchedRoute);
    }
  }
  await next();
}
