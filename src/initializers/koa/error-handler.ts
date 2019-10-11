import * as Koa from 'koa';
import { getLogger } from '../log4js';
import { OrkaOptions } from 'orka/typings/orka';
import { omit } from 'lodash';

const logger = getLogger('orka.errorHandler');

const isBlacklisted = (err: { status: number } = {} as any, config) =>
  err.status && config.blacklistedErrorCodes.includes(err.status);

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
          query: omit(ctx.request.query, orkaOptions.omitErrorKeys),
          requestId: ctx.state.requestId,
          body: omit(ctx.request.body, orkaOptions.omitErrorKeys)
        }
      });

      ctx.body = err.expose ? err.exposedMsg || err.message : ctx.body;
      ctx.status = err.status || 500;

      const errorArgs = (await orkaOptions.errorHandler(ctx, err, orkaOptions)) || [err as Error];
      if (!isBlacklisted(err, config)) {
        logger.error(...errorArgs);
      } else {
        logger.warn(...errorArgs);
      }
    }
  };
