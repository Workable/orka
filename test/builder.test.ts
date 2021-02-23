import builder from '../src/builder';
import defaults from '../src/default-options';
import 'should';

describe('builder', function() {
  it('initializes typescript');

  it('initializes diamorphosis');
  it('initializes honeybadger');

  it('initializes log4js');
  it('initializes newrelic');
  it('initializes datadog tracer');
  it('initializes koa');

  it('appends middleware koa');
  it('prepends middleware koa');
  it('uses port');

  it('should get app name from config', () => {
    const staticOptions = { diamorphosis: { configFolder: './examples/simple-example' } };
    const orkaBuilder = builder(staticOptions);
    const { appName } = orkaBuilder.options;
    appName.should.equal('foo');
  });
});
