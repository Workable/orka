import { Context } from 'koa';
import { isHealthy } from '../initializers/rabbitmq';

export default async function(ctx: Context, next: () => Promise<null>) {
  const mongoose = await import('mongoose');
  const { getConnection } = await import('../initializers/mongodb');

  // tslint:disable-next-line: no-empty
  const mongoConnection = getConnection(() => {});
  // tslint:disable-next-line: no-empty
  const isRabbitHealthy = isHealthy();
  if ((!mongoConnection || mongoConnection.readyState === mongoose.Connection.STATES.connected) && isRabbitHealthy) {
    const OrkaBuilder = (await import('../orka-builder')).default;
    ctx.status = 200;
    ctx.body = {
      env: OrkaBuilder.INSTANCE.config.nodeEnv,
      version: `v${process.env.npm_package_version}`
    };
  } else {
    ctx.status = 503;
  }
  await next();
}
