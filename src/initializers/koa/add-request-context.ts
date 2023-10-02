import { AsyncLocalStorage } from 'async_hooks';
import { Context, Middleware } from 'koa';
import { getRootSpan } from '../../helpers';
import { appendToStore } from '../../utils';

export default function (als: AsyncLocalStorage<Map<string, any>>, config): Middleware {
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

      appendToStore(store, ctx, config);

      return next();
    });
  };
}
