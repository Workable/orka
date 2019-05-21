import * as Koa from 'koa';
import { Middleware } from 'koa-compose';

export default async (port: number, middlewares: Middleware<any>[], callback: () => any) => {
  let app = new Koa();
  middlewares.forEach(middleware => app.use(middleware));
  return app.listen(port, callback);
};
