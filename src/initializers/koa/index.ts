import * as Koa from 'koa';
import { Middleware } from 'koa-compose';
export let app: Koa;

export default async (port: number, middlewares: Middleware<any>[], callback: () => any) => {
  app = new Koa();
  middlewares.forEach(middleware => app.use(middleware));
  app.listen(port, callback);
};
