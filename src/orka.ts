import * as lodash from 'lodash';
import builder from './builder';
import defaults from './default-options';
import { OrkaOptions } from './typings/orka';

const fromOptions = (options: Partial<OrkaOptions>) => {
  if (options.builder) {
    options.builder.options = lodash.defaultsDeep(options, options.builder.options, defaults);
  }
  return (options.builder || builder(lodash.defaultsDeep(options, defaults)))
    .forTypescript(options.typescript)
    .use(options.beforeMiddleware)
    .useDefaults()
    .use(options.afterMiddleware)
    .withLogo(options.logoPath)
    .withRabbitMQ(options.rabbitOnConnected)
    .withHoneyBadger()
    .withKafka()
    .withMongoDB(options.mongoOnConnected)
    .withRedis()
    .withPrometheus()
    .withBull()
    .withPostgres()
    .loadGrowthbookFeatures()
    .with(options.beforeStart)
    .routes(options.routesPath);
};

export default fromOptions;
