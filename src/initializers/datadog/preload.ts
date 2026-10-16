import requireInjected from '../../require-injected';

if (process.env.DD_SERVICE && process.env.DD_ENV) {
  try {
    requireInjected('dd-trace').init();
  } catch (e) {
    // dd-trace must initialize before anything else is loaded, so log4js is not available yet.
    // Write the same shape as json-appender so log aggregators report it as a single error entry.
    if (process.env.LOG_JSON === 'true') {
      console.log(
        JSON.stringify({
          timestamp: new Date(),
          severity: 'ERROR',
          categoryName: 'orka.initializers.datadog',
          message: e?.message,
          stack_trace: e?.stack
        })
      );
    }
    throw e;
  }
}
