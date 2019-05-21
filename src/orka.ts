import * as lodash from 'lodash';
import builder from './builder';
import defaults from './default-options';
import { OrkaOptions } from './typings/orka';

const fromOptions = (options: Partial<OrkaOptions>) => {
  const orka = builder(lodash.defaultsDeep(options, defaults))
    .use(options.beforeMiddleware)
    .useDefaults()
    .use(options.afterMiddleware)
    .withNewrelic()
    .withHoneyBadger()
    .with(options.beforeStart)
    .withLogo(options.logoPath)
    .routes(options.routesPath);
  return options.typescript ? orka.forTypescript() : orka;
};

export default fromOptions;
