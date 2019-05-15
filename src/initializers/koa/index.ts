import * as Koa from 'koa';
import { getLogger } from '../log4js';
import riviere from './riviere';
import * as compress from 'koa-compress';
import * as cors from 'koa2-cors';
import addRequestId from './add-request-id';
import errorHander from './error-handler';
import * as bodyParser from 'koa-bodyparser';
import { router } from 'fast-koa-router';
import { OrkaOptions } from 'typings/Orka';

const logger = getLogger('orka.initializers.koa');
export let app: Koa;

export default async (config, orkaOptions: OrkaOptions) => {
  const allowedOrigin = new RegExp('https?://(www\\.)?([^.]+\\.)?(' + config.allowedOrigins.join(')|(') + ')');
  const routes = await import(orkaOptions.routesPath);
  app = new Koa();

  orkaOptions.beforeMiddleware.forEach(m => app.use(m));
  app
    .use(riviere(config))
    .use(compress())
    .use(
      cors({
        origin: ctx =>
          allowedOrigin.test(ctx.request.headers.origin) ? ctx.request.headers.origin : config.allowedOrigins[0]
      })
    )
    .use(addRequestId(config))
    .use(errorHander(config))
    .use(bodyParser())
    .use(router(routes));

  orkaOptions.afterMiddleware.forEach(m => app.use(m));

  app.listen(config.port, () => {
    logger.info(`Server listening to http://localhost:${config.port}/`);
    logger.info(`Server environment: ${config.nodeEnv}`);
  });
};
