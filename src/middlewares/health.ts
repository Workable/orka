import { Context } from 'koa';
import { getConnection } from '../initializers/mongodb';
import { isHealthy } from '../initializers/rabbitmq';
import * as mongoose from 'mongoose';

export default async function(ctx: Context) {
  // tslint:disable-next-line: no-empty
  const mongoConnection = getConnection(() => {});
  // tslint:disable-next-line: no-empty
  const isRabbitHealthy = isHealthy();
  if ((!mongoConnection || mongoConnection.readyState === mongoose.Connection.STATES.connected) && isRabbitHealthy) {
    ctx.status = 200;
  } else {
    ctx.status = 503;
  }
}
