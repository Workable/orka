import { Context } from 'koa';
import { getConnection } from '../initializers/mongodb';

export default async function(ctx: Context) {
  // tslint:disable-next-line: no-empty
  const mongoConnection = getConnection(() => {});
  if (!mongoConnection || mongoConnection.readyState === 1) {
    ctx.status = 200;
  } else {
    ctx.status = 503;
  }
}
