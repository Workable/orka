import { AsyncLocalStorage } from 'async_hooks';
import { Context, Middleware } from 'koa';

export default function(als: AsyncLocalStorage<Map<string, any>>): Middleware {
  return async (ctx: Context, next: () => Promise<void>) => {
    const store = new Map<string, any>();
    return als.run(store, () => {
      if (ctx.state.requestId) {
        store.set('requestId', ctx.state.requestId);
      }
      if (ctx.req?._datadog?.span) {
        store.set('ddSpan', ctx.req._datadog.span);
      }
      return next();
    });
  };
}
