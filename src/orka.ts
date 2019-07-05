import * as lodash from 'lodash';
import builder from './builder';
import defaults from './default-options';
import { OrkaOptions } from './typings/orka';

const fromOptions = (options: Partial<OrkaOptions>) => {
  return builder(lodash.defaultsDeep(options, defaults))
    .forTypescript(options.typescript)
    .use(options.beforeMiddleware)
    .useDefaults()
    .use(options.afterMiddleware)
    .withLogo(options.logoPath)
    .withNewrelic()
    .withRabbitMQ(options.rabbitHandlers)
    .withHoneyBadger()
    .withKafka()
    .with(options.beforeStart)
    .routes(options.routesPath);
};

export default fromOptions;
