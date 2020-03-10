import { Context } from 'koa';
import { getConnection } from '../initializers/mongodb';
import * as mongoose from 'mongoose';

export default async function(ctx: Context) {
  // tslint:disable-next-line: no-empty
  const mongoConnection = getConnection(() => {});
  if (!mongoConnection || mongoConnection.readyState === mongoose.Connection.STATES.connected) {
    ctx.status = 200;
  } else {
    ctx.status = 503;
  }
}
