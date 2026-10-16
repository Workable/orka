import { spawnSync } from 'child_process';
import * as path from 'path';
import 'should';

describe('orka start-up', function () {
  this.timeout(30000);

  // Datadog files container stderr as error, so a warning on every start-up shows up as a fake error.
  it('does not print Node warnings to stderr', () => {
    // Newer Node versions warn about require() of ES modules only with this flag; Node 22.12 always does.
    const flags = process.allowedNodeEnvironmentFlags.has('--trace-require-module')
      ? ['--trace-require-module=all']
      : [];
    const { status, stderr } = spawnSync(
      process.execPath,
      [...flags, '-r', 'ts-node/register', path.join(__dirname, 'fixtures/startup.js')],
      { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' }
    );

    // Node process warnings look like '(node:123) ExperimentalWarning: …'.
    stderr.should.not.match(/\(node:\d+\) \w*Warning:/);
    status.should.equal(0);
  });
});
