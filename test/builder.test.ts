import { describe, it } from 'node:test';
import assert from 'node:assert';
import builder from '../src/builder';
import defaults from '../src/default-options';

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

  it('should get app name from config if not set', () => {
    const staticOptions = { diamorphosis: { configFolder: './examples/simple-example' } };
    const orkaBuilder = builder(staticOptions);
    const { appName } = orkaBuilder.options;
    assert.strictEqual(appName, 'foo');
  });

  it('should get app name from options.appName if set', () => {
    const staticOptions = { appName: 'orka', diamorphosis: { configFolder: './examples/simple-example' } };
    const orkaBuilder = builder(staticOptions);
    const { appName } = orkaBuilder.options;
    assert.strictEqual(appName, 'orka');
  });
});
