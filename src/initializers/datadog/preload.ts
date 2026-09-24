import requireInjected from '../../require-injected';

if (process.env.DD_SERVICE && process.env.DD_ENV) {
  requireInjected('dd-trace').init();
}
