import { Context, Middleware } from 'koa';

export default function(config): Middleware {
  return async function(ctx: Context, next: () => void) {
    const requestId = ctx.headers[config.traceHeaderName.toLowerCase()];
    ctx.state.requestId = requestId;
    return await next();
  };
}
