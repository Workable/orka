import { Context, Next } from 'koa';
import * as qs from 'qs';

export default async function parseQuerystring(ctx: Context, next: Next) {
  if (ctx.querystring) {
    ctx.state.query = qs.parse(ctx.querystring);
  }
  return next();
}
