import { AsyncLocalStorage } from 'async_hooks';
import { Context, Middleware } from 'koa';
import { pick } from 'lodash';
import { getRootSpan } from '../../helpers';

export default function(als: AsyncLocalStorage<Map<string, any>>, config): Middleware {
  return async function addRequestContext(ctx: Context, next: () => Promise<void>) {
    const store = new Map<string, any>();
    return als.run(store, () => {
      if (ctx.state.requestId) {
        store.set('requestId', ctx.state.requestId);
      }

      const span = getRootSpan(ctx);
      if (span) {
        store.set('ddSpan', span);
      }

      if (config.requestContext.istioTraceContextHeaders.enabled) {
        const istioHeaders = pick(ctx.headers, config.requestContext.istioTraceContextHeaders.headers);
        store.set('istio-headers', istioHeaders);
      }

      if (config.requestContext.headerPropagation.enabled) {
        const propagatedHeaders = pick(ctx.headers, config.requestContext.headerPropagation.headers);
        store.set('propagated-headers', propagatedHeaders);
      }

      return next();
    });
  };
}
