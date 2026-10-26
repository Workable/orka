import { writeSync } from 'fs';
import requireInjected from '../../require-injected';

if (process.env.DD_SERVICE && process.env.DD_ENV) {
  try {
    requireInjected('dd-trace').init();
  } catch (e) {
    if (process.env.LOG_JSON !== 'true') throw e;

    // dd-trace must initialize before anything else is loaded, so log4js is not available yet.
    // Write the same shape as json-appender so log aggregators report it as a single error entry.
    const log = {
      timestamp: new Date(),
      severity: 'ERROR',
      categoryName: 'orka.initializers.datadog',
      message: e?.message,
      stack_trace: e?.stack
    };
    writeSync(1, JSON.stringify(log) + '\n');
    // Rethrowing would make Node print the stack again as plain text lines, each reported as a separate entry.
    // Nothing can handle this error anyway: it is thrown while the app is still importing orka.
    process.exit(1);
  }
}
