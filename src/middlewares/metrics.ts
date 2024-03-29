import { Context } from 'koa';
import { getPrometheus, getBull } from '../index';

export default async function(ctx: Context, next: () => Promise<null>) {
  const prom = getPrometheus();
  if (prom) {
    const config = (await import('../orka-builder')).default.INSTANCE.config;
    if (config.bull) {
      await getBull().updateMetrics();
    }
    // Export metrics
    ctx.type = prom.contentType;
    ctx.body = await prom.metrics();
    ctx.status = 200;
  } else {
    ctx.status = 404;
  }
  await next();
}
