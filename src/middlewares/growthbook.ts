import {Context} from 'koa';
import {getGrowthbook, getRequestContext} from '../index';
import {getLogger} from '../initializers/log4js';

const logger = getLogger('orka.middlewares.growthbook');

export default async function growthbook(ctx: Context, next: () => Promise<void>) {
  if (ctx.path === '/health') return next();
  const gb = getGrowthbook();
  if (!gb) return next();
  ctx.state.growthbook = gb;
  await gb.loadFeatures().catch(e => logger.error(e, 'failed to load growthbook'));
  if (ctx.state.growthbook) {
    getRequestContext()?.set('growthbook', ctx.state.growthbook);
  }
  await next();
}
