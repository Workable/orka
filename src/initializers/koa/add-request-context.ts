import { AsyncLocalStorage } from 'async_hooks';
import { Context, Middleware } from 'koa';
import { pick } from 'lodash';

export default function(als: AsyncLocalStorage<Map<string, any>>, config): Middleware {
  return async function addRequestContext(ctx: Context, next: () => Promise<void>) {
    const store = new Map<string, any>();
    return als.run(store, () => {
      if (ctx.state.requestId) {
        store.set('requestId', ctx.state.requestId);
      }
      if (ctx.req?._datadog?.span) {
        store.set('ddSpan', ctx.req._datadog.span);
      }
      if (config.requestContext.istioTraceContextHeaders.enabled) {
        const istioHeaders = pick(ctx.headers, config.requestContext.istioTraceContextHeaders.headers);
        store.set('istio-headers', istioHeaders);
      }
      return next();
    });
  };
}
