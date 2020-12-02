import { Context } from 'koa';
import { getPrometheus, getBull } from '../index';

export default async function(ctx: Context, next: () => Promise<null>) {
  const prom = getPrometheus();
  if (prom) {
    // Refresh bull metrics, before exporting
    await getBull().updateMetrics();
    // Export metrics
    ctx.type = prom.contentType;
    ctx.body = prom.metrics();
    ctx.status = 200;
  } else {
    ctx.status = 404;
  }
  await next();
}
