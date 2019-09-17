import * as lodash from 'lodash';
import builder from './builder';
import defaults from './default-options';
import { OrkaOptions } from './typings/orka';
import OrkaBuilder from './orka-builder';

const fromOptions = (options: Partial<OrkaOptions & { builder?: OrkaBuilder }>) => {
  return (options.builder || builder(lodash.defaultsDeep(options, defaults)))
    .forTypescript(options.typescript)
    .use(options.beforeMiddleware)
    .useDefaults()
    .use(options.afterMiddleware)
    .withLogo(options.logoPath)
    .withRabbitMQ(options.rabbitOnConnected)
    .withHoneyBadger()
    .withKafka()
    .withMongoDB()
    .with(options.beforeStart)
    .routes(options.routesPath);
};

export default fromOptions;
