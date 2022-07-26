import * as Koa from 'koa';
import { getLogger } from '../log4js';
import { OrkaOptions } from 'orka/typings/orka';
import { omit } from 'lodash';
const Levels = require('log4js/lib/levels');
const logger = getLogger('orka.errorHandler');

export const isBlacklisted = (err: { status: number } = {} as any, config) =>
  // tslint:disable-next-line:triple-equals
  err.status && config.blacklistedErrorCodes.some(b => err.status == b);

export const onlyWarn = (err) => {
  const levelStr = err?.logLevel;
  if (typeof levelStr !== 'string') return false;
  const level = Levels[levelStr.toUpperCase()]?.level;
  if (!level) return false;
  return level <= Levels.WARN.level;
};

export default (config, orkaOptions: Partial<OrkaOptions>) =>
  async function errorHandler(ctx: Koa.Context, next: () => Promise<any>) {
    try {
      await next();
    } catch (err) {
      if (config.env === 'development') {
        ctx.body = err.stack;
      }

      Object.assign(err, {
        component: err.component || 'koa',
        action: err.action || ctx._matchedRoute || ctx.request.path,
        params: {
          path: ctx.params,
          query: omit(ctx.request.query, orkaOptions.omitErrorKeys),
          requestId: ctx.state.requestId,
          body: omit(ctx.request.body, orkaOptions.omitErrorKeys)
        }
      });

      ctx.body = err.expose ? err.exposedMsg || err.message : ctx.body;
      ctx.status = err.status || 500;

      const errorArgs = (await orkaOptions.errorHandler(ctx, err, orkaOptions)) || [err as Error];
      if (isBlacklisted(err, config) || onlyWarn(err)) {
        logger.warn(...errorArgs);
      } else {
        logger.error(...errorArgs);
      }
    }
  };
