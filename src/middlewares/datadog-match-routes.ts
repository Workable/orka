import { Context } from 'koa';

export default async function matchedRoute(ctx: Context, next: () => Promise<void>) {
  if (ctx._matchedRoute) {
    const ddSpan = ctx.req?._datadog?.span;
    if (ddSpan) {
      ddSpan.setTag('resource.name', `${ctx.request.method} ${ctx._matchedRoute}`);
      ddSpan.setTag('matchedRoute', ctx._matchedRoute);
    }
  }
  await next();
}
