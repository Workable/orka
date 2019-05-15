import * as Koa from 'koa';
import { getLogger } from '../log4js';

const logger = getLogger('orka.errorHandler');

const isBlacklisted = (err: { status: number } = {} as any, config) =>
  err.status && config.blacklistedErrorCodes.includes(err.status);

export default config => async (ctx: Koa.Context, next: () => Promise<any>) => {
  try {
    await next();
  } catch (err) {
    if (config.env === 'development') {
      ctx.body = err.stack;
    }

    Object.assign(err, {
      component: err.component || 'koa',
      action: err.action || ctx._matchedRoute,
      params: {
        ...ctx.request.query,
        requestId: ctx.state.requestId,
        body: (ctx.request as any).body
      }
    });

    if (!isBlacklisted(err, config)) {
      logger.error(err, ctx.state);
    } else {
      logger.warn(err);
    }

    ctx.body = err.expose ? err.exposedMsg || err.message : ctx.body;
    ctx.status = err.status || 500;
  }
};
