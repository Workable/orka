import { getPrometheus } from '../initializers/prometheus';
import { getNewRelic } from '../initializers/newrelic';
import type OrkaBuilderType from '../orka-builder';
import { getLogger } from '../initializers/log4js';

const logger = getLogger('orka.helpers.log-metrics');
const logMetrics = {
  prometheusEndClient() {
    return getPrometheus().timeSummary;
  },

  prometheusRecordMetricsClient() {
    return getPrometheus().eventSummary;
  },

  start() {
    return process.hrtime.bigint();
  },

  end(start: bigint, flow: string, flowType: string, id: string, enableLog: boolean = true) {
    const ns = process.hrtime.bigint() - start;
    const s = Number(ns) / 1e9;
    if (prometheusTimeEnabled()) logMetrics.prometheusEndClient().observe({ flow, flowType }, s);
    if (newRelicEnabled()) getNewRelic().recordMetric(`Custom/${flowType}/${flow}`, s);
    if (enableLog) logger.debug(`[${id}] TIME_LOGGING[${flowType}][${flow}] ${s.toFixed(3)} s`);
  },

  recordMetric(event: string, eventType: string, value: number, enableLog: boolean = true) {
    if (enableLog) logger.debug(`[${eventType}][${event}]: ${value}`);

    if (newRelicEnabled()) getNewRelic().recordMetric('Custom/' + eventType + '/' + event, value);
    if (prometheusEventEnabled()) logMetrics.prometheusRecordMetricsClient().observe({ event, eventType }, value);
  }
};

function prometheusTimeEnabled() {
  const OrkaBuilder: typeof OrkaBuilderType = require('../orka-builder').default;
  const config = OrkaBuilder.INSTANCE?.config;
  return config?.prometheus?.enabled && config?.prometheus?.timeSummary?.enabled;
}

function prometheusEventEnabled() {
  const OrkaBuilder: typeof OrkaBuilderType = require('../orka-builder').default;
  const config = OrkaBuilder.INSTANCE?.config;
  return config?.prometheus?.enabled && config?.prometheus?.eventSummary?.enabled;
}

function newRelicEnabled() {
  return !!process.env.NEW_RELIC_LICENSE_KEY;
}

export default logMetrics;
