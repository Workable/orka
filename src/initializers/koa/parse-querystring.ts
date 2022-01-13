import { Context, Next } from 'koa';
import * as qs from 'qs';

export default async function parseQuerystring(ctx: Context, next: Next) {
  if (ctx.querystring) {
    let query;
    Object.defineProperty(ctx.state, 'query', {
      get() {
        return query || qs.parse(ctx.querystring);
      },
      set(v) {
        query = v;
      }
    });
  }
  return next();
}
