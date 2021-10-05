import { Context, Middleware } from 'koa';
import { getLogger } from 'log4js';
import { getRequestContext } from '../../builder';
import * as uuid from 'uuid';

const logger = getLogger('orka.visitor');

export const decode = (cookie?: string) => (cookie && JSON.parse(decodeURIComponent(cookie))) || {};

export default function (config): Middleware {
  return async function addVisitorId(ctx: Context, next: () => void) {
    if (ctx.path === '/health' || !config?.visitor?.cookie || config?.visitor?.enabled === false) {
      return await next();
    }
    const cookie = ctx.cookies && ctx.cookies.get(config.visitor.cookie);
    try {
      const { cookie_id: visitor } = decode(cookie);
      if (uuid.validate(visitor)) {
        ctx.state.visitor = visitor;
        getRequestContext()?.set('visitor', ctx.state.visitor);
      }
    } catch (e) {
      logger.warn(`Failed to parse cookie ${config.visitor.cookie} = ${cookie}`, e);
    } finally {
      return next();
    }
  };
}
