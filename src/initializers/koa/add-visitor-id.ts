import { Context, Middleware } from 'koa';
import { getLogger } from 'log4js';
import { getRequestContext } from '../../builder';
import { SetOption } from 'cookies';
import { URL } from 'url';
import { randomUUID } from 'crypto';
import * as ms from 'ms';

// Same pattern as uuid's validate(). The uuid package is ESM-only, and loading it with require() prints an
// ExperimentalWarning on stderr on some Node versions (e.g. 22.12), which log aggregators report as an error.
const UUID_PATTERN =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
export const isUUID = (value: unknown) => typeof value === 'string' && UUID_PATTERN.test(value);

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
      if (isUUID(decoded?.cookie_id)) {
        ctx.state.visitor = decoded.cookie_id;
      }
    } catch (e) {
      logger.error(`Failed to parse cookie ${config.visitor.cookie} = ${cookie}`, e);
    }

    if (config.visitor.setCookie && !ctx.state.visitor) {
      ctx.state.visitor = randomUUID();
      if (config.visitor.secure && !ctx.cookies.secure) {
        // Force secure cookies in context, when our ENV dictates to always use secure=true;.
        ctx.cookies.secure = true;
      }

      const options: SetOption = {
        domain: getCookieDomain(ctx, config),
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

  function getCookieDomain(ctx: Context, config): string {
    // custom cb function takes precedence
    if (config.visitor.getCookieDomain && typeof config.visitor.getCookieDomain === 'function') {
      return config.visitor.getCookieDomain(ctx);
    }

    // utilizes the original origin
    // even when  app is behind proxy
    // https://github.com/koajs/koa/issues/1008#issuecomment-2872014479
    if (URL.canParse(ctx.request.URL.origin)) {
      return domain(ctx.request.URL.hostname);
    } else {
      // get hostname from Host header
      // or X-Forwarded-Host when is proxy enabled
      // https://github.com/koajs/koa/blob/master/lib/request.js#L281
      return domain(ctx.hostname);
    }
  }
}
