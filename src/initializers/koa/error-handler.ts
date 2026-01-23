import * as Koa from 'koa';
import { getLogger } from '../log4js';
import { OrkaOptions } from 'orka/typings/orka';
import { omit } from 'lodash';
import { levels as Levels } from 'log4js';

export const isBlacklisted = (err: { status: number; blacklist: boolean } = {} as any, config) =>
  // tslint:disable-next-line:triple-equals
  err.blacklist || (err.status && config.blacklistedErrorCodes.some(b => err.status == b));

export const getExplicitLogLevel = err => {
  const levelStr = err?.logLevel;
  if (typeof levelStr !== 'string') return null;
  const level = Levels[levelStr.toUpperCase()]?.levelStr;
  if (!level) return null;
  return levelStr.toLowerCase();
};

export default (config, orkaOptions: Partial<OrkaOptions>) => {
  const logger = getLogger('orka.errorHandler');

  return async function errorHandler(ctx: Koa.Context, next: () => Promise<any>) {
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
          body: omit(ctx.request.body as any, orkaOptions.omitErrorKeys)
        }
      });

      ctx.body = err.expose ? err.exposedMsg || err.message : ctx.body;
      ctx.status = err.status || 500;

      const errorArgs = (await orkaOptions.errorHandler(ctx, err, orkaOptions)) || [err as Error];
      const explicitLevel = getExplicitLogLevel(err);
      const blackslisted = isBlacklisted(err, config);

      if (explicitLevel) {
        logger[explicitLevel](...errorArgs);
      } else if (blackslisted) {
        logger.warn(...errorArgs);
      } else {
        logger.error(...errorArgs);
      }
    }
  };
};
