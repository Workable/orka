import { Context, Middleware } from 'koa';
import { getLogger } from 'log4js';
import { getRequestContext } from '../../builder';
import { SetOption } from 'cookies';
import { URL } from 'url';
import * as uuid from 'uuid';
import * as ms from 'ms';

export const decode = (cookie?: string) => (cookie && JSON.parse(decodeURIComponent(cookie))) || {};
export const encode = (cookie: any) => encodeURIComponent(JSON.stringify(cookie || {}));
export const domain = (hostname: string) => {
  const [_subdomain, _domain, _ext] = (hostname && hostname.split('.')) || [, , , undefined];
  return (_ext ? ['', _domain, _ext] : _domain ? ['', _subdomain, _domain] : [_subdomain]).join('.');
};

export default function (config): Middleware {
  const logger = getLogger('orka.visitor');

  return async function addVisitorId(ctx: Context, next: () => void) {
    if (ctx.path === '/health' || !config?.visitor?.cookie || config?.visitor?.enabled === false) {
      return next();
    }
    const cookie = ctx.cookies && ctx.cookies.get(config.visitor.cookie);
    let decoded;
    try {
      decoded = decode(cookie);
      if (uuid.validate(decoded?.cookie_id)) {
        ctx.state.visitor = decoded.cookie_id;
      }
    } catch (e) {
      logger.error(`Failed to parse cookie ${config.visitor.cookie} = ${cookie}`, e);
    }

    if (config.visitor.setCookie && !ctx.state.visitor) {
      ctx.state.visitor = uuid.v4();
      if (config.visitor.secure && !ctx.cookies.secure) {
        // Force secure cookies in context, when our ENV dictates to always use secure=true;.
        ctx.cookies.secure = true;
      }

      let cookieDomain = domain((ctx.origin && new URL(ctx.origin).hostname) || ctx.hostname);
      if (config.visitor.getCookieDomain && typeof config.visitor.getCookieDomain === 'function') {
        cookieDomain = config.visitor.getCookieDomain(ctx);
      }

      const options: SetOption = {
        domain: cookieDomain,
        maxAge: config.visitor.maxAge && ms(config.visitor.maxAge),
        httpOnly: false,
        secure: config.visitor.secure,
        sameSite: 'none'
      };
      logger.debug(`cookie '${config.visitor.cookie}' missing, generating new uuid '${ctx.state.visitor}' `, options);
      ctx.cookies.set(config.visitor.cookie, encode({ ...(decoded || {}), cookie_id: ctx.state.visitor }), options);
    }

    if (ctx.state.visitor) {
      getRequestContext()?.set('visitor', ctx.state.visitor);
    }
    return next();
  };
}
