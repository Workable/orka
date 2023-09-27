import { Context, Middleware } from 'koa';
import { randomUUID } from 'crypto';

export default function (config): Middleware {
  return async function addRequestId(ctx: Context, next: () => void) {
    let requestId = ctx.headers[config.traceHeaderName.toLowerCase()];
    if (!requestId) {
      requestId = `orka-${randomUUID()}`;
      ctx.headers[config.traceHeaderName.toLowerCase()] = requestId;
    }
    ctx.state.requestId = requestId;
    return await next();
  };
}
