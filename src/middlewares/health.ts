import { Context } from 'koa';
import { isHealthy } from '../initializers/rabbitmq';

export default async function(ctx: Context) {
  const mongoose = await import('mongoose');
  const { getConnection } = await import('../initializers/mongodb');

  // tslint:disable-next-line: no-empty
  const mongoConnection = getConnection(() => {});
  // tslint:disable-next-line: no-empty
  const isRabbitHealthy = isHealthy();
  if ((!mongoConnection || mongoConnection.readyState === mongoose.Connection.STATES.connected) && isRabbitHealthy) {
    ctx.status = 200;
    ctx.body = {
      version: process.env.npm_package_version
    };
  } else {
    ctx.status = 503;
  }
}
