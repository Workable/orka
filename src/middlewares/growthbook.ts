import {Context} from 'koa';
import {createGrowthbook, getRequestContext} from '../index';
import {getLogger} from '../initializers/log4js';

const logger = getLogger('orka.middlewares.growthbook');

export default async function growthbook(ctx: Context, next: () => Promise<void>) {
  if (ctx.path === '/health') return next();
  const OrkaBuilder = (await import('../orka-builder')).default;
  const config = OrkaBuilder.INSTANCE?.config?.growthbook;
  if (!config?.clientKey) return next();
  const gb = createGrowthbook(config);
  ctx.state.growthbook = gb;
  await gb.loadFeatures({timeout: config.timeout}).catch(e => logger.error(e, 'failed to load growthbook'));
  if (OrkaBuilder.INSTANCE?.options?.growthbookAttributes) {
    gb.setAttributes(OrkaBuilder.INSTANCE.options.growthbookAttributes(ctx));
  }
  if (ctx.state.growthbook) {
    getRequestContext()?.set('growthbook', ctx.state.growthbook);
  }
  await next();
  gb.destroy();
}
