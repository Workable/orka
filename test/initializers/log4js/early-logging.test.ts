import { spawnSync } from 'child_process';
import * as path from 'path';
import { omit } from 'lodash';
import 'should';

const run = (fixture: string, env: Record<string, string> = {}) =>
  spawnSync(process.execPath, ['-r', 'ts-node/register', path.join(__dirname, 'fixtures', fixture)], {
    cwd: path.resolve(__dirname, '../../..'),
    env: { ...omit(process.env, ['LOG_JSON', 'DD_SERVICE', 'DD_ENV', 'NEW_RELIC_LICENSE_KEY']), ...env },
    encoding: 'utf8'
  });

const jsonLines = (stdout: string) =>
  stdout
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));

describe('log4js early logging', function () {
  this.timeout(30000);

  it('logs a dd-trace preload failure as a single JSON error line with LOG_JSON and still fails', () => {
    const { status, stdout } = run('preload-failure.js', { LOG_JSON: 'true', DD_SERVICE: 'orka', DD_ENV: 'test' });

    status.should.not.equal(0);
    const lines = jsonLines(stdout);
    lines.should.have.length(1);
    lines[0].should.containDeep({
      severity: 'ERROR',
      categoryName: 'orka.initializers.datadog',
      message: 'Version check of module "dd-trace" failed'
    });
    lines[0].stack_trace.should.startWith('Error: Version check of module "dd-trace" failed\n');
  });

  it('keeps a dd-trace preload failure human readable without LOG_JSON', () => {
    const { status, stdout, stderr } = run('preload-failure.js', { DD_SERVICE: 'orka', DD_ENV: 'test' });

    status.should.not.equal(0);
    stdout.should.equal('');
    stderr.should.containEql('Error: Version check of module "dd-trace" failed');
  });

  it('logs an initialization failure before log4js is configured as a single JSON error line and still fails', () => {
    const { status, stdout } = run('builder-failure.js', { LOG_JSON: 'true', NEW_RELIC_LICENSE_KEY: 'key' });

    status.should.not.equal(0);
    const errors = jsonLines(stdout).filter(line => line.severity === 'ERROR');
    errors.should.have.length(1);
    errors[0].should.containDeep({ message: 'Version check of module "newrelic" failed' });
    errors[0].stack_trace.should.startWith('Error: Version check of module "newrelic" failed\n');
  });

  it('logs under the plain name with a logger taken before log4js is configured', () => {
    const { status, stdout } = run('early-logger.js');

    status.should.equal(0);
    jsonLines(stdout).should.containDeep([{ categoryName: 'app', message: 'after configure' }]);
  });
});
