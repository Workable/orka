import { Context, Middleware } from 'koa';

export const decode = (cookie?: string) => (cookie && JSON.parse(decodeURIComponent(cookie))) || {};

export default function(config): Middleware {
  return async function addVisitorId(ctx: Context, next: () => void) {
    if (ctx.path === '/health' || !config.visitor || !config.visitor.cookie) {
      return await next();
    }
    const cookie = ctx.cookies && ctx.cookies.get(config.visitor.cookie);
    const { cookie_id: visitor } = decode(cookie);
    ctx.state.visitor = visitor;
    return await next();
  };
}
