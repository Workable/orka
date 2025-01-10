import { Context } from 'koa';
import { getRootSpan } from '../helpers';

export default async function matchedRoute(ctx: Context, next: () => Promise<void>) {
  if (ctx._matchedRoute) {
    const ddSpan = getRootSpan(ctx);

    if (ddSpan) {
      ddSpan.setTag('resource.name', `${ctx.request.method} ${ctx._matchedRoute}`);
      ddSpan.setTag('matchedRoute', ctx._matchedRoute);
      ddSpan.setTag('params', ctx.params);
    }
  }
  await next();
}
