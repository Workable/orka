import * as Koa from 'koa';
import { Middleware } from 'koa-compose';

export function getApp() {
  return new Koa();
}

export const listen = async (app: Koa<any, {}>, port: number, middlewares: Middleware<any>[], callback: () => any) => {
  middlewares.forEach(middleware => app.use(middleware));
  return app.listen(port, callback);
};

export const callback = (app: Koa<any, {}>, middlewares: Middleware<any>[]) => {
  middlewares.forEach(middleware => app.use(middleware));
  return app.callback();
};
