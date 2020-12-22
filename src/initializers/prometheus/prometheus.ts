import requireInjected from '../../require-injected';
// prettier-ignore
import type {
  Registry as RegistryType,
  Pushgateway as PushgatewayType,
  Gauge as GaugeType,
  Counter as CounterType,
  Histogram as HistogramType,
  Summary as SummaryType,
  SummaryConfiguration,
  HistogramConfiguration
} from 'prom-client';

const {
  Registry,
  Counter,
  Gauge,
  Pushgateway,
  Histogram,
  Summary
}: {
  Summary: typeof SummaryType;
  Histogram: typeof HistogramType;
  Pushgateway: typeof PushgatewayType;
  Registry: typeof RegistryType;
  Counter: typeof CounterType;
  Gauge: typeof GaugeType;
} = requireInjected('prom-client');
import { pickBy, snakeCase } from 'lodash';

type metricType = 'custom' | 'external';

type metricOptionsType = {
  enabled: boolean;
  labels: string[];
  type: metricType;
  name: string;
  help: string;
  ageBuckets: number;
  maxAgeSeconds: number;
};

type optionsType = {
  gatewayUrl: string;
  timeSummary?: metricOptionsType;
  eventSummary?: metricOptionsType;
};
export default class Prometheus {
  registry: RegistryType;
  private appName: string;
  private gatewayUrl: string;
  private gateway: PushgatewayType;
  public timeSummary: SummaryType<string>;
  public eventSummary: SummaryType<string>;

  constructor(appName: string, options?: optionsType) {
    this.registry = new Registry();
    this.appName = appName;
    this.gatewayUrl = options?.gatewayUrl;
    if (this.gatewayUrl) {
      this.gateway = new Pushgateway(this.gatewayUrl, {}, this.registry);
    }
    let metric = options?.timeSummary;
    if (metric?.enabled) {
      this.timeSummary = this.registerSummary(metric.type, metric.name, metric.help, metric.labels, {
        ageBuckets: metric.ageBuckets,
        maxAgeSeconds: metric.maxAgeSeconds
      });
    }
    metric = options?.eventSummary;
    if (metric?.enabled) {
      this.eventSummary = this.registerSummary(metric.type, metric.name, metric.help, metric.labels, {
        ageBuckets: metric.ageBuckets,
        maxAgeSeconds: metric.maxAgeSeconds
      });
    }
  }

  public fullName(type: metricType, name: string) {
    return snakeCase(`${type}_${this.appName}_${name}`);
  }

  public baseConfig(type: metricType, name: string, help: string, labelNames?: string[]) {
    const fullName = this.fullName(type, name);
    if (this.registry.getSingleMetric(fullName)) {
      throw new Error(`Metric ${name} is already registered`);
    }
    return {
      name: fullName,
      help,
      labelNames,
      registers: [this.registry]
    };
  }

  public registerCounter(type: metricType, name: string, help: string, labelNames?: string[]): CounterType<string> {
    const config = this.baseConfig(type, name, help, labelNames);
    return new Counter(config);
  }

  public registerGauge(type: metricType, name: string, help: string, labelNames?: string[]): GaugeType<string> {
    const config = this.baseConfig(type, name, help, labelNames);
    return new Gauge(config);
  }

  public registerHistogram(
    type: metricType,
    name: string,
    help: string,
    labelNames: string[],
    buckets?
  ): HistogramType<string> {
    const config = this.baseConfig(type, name, help, labelNames);
    const options = pickBy<HistogramConfiguration<string>>({ ...config, buckets }) as HistogramConfiguration<string>;
    return new Histogram(options);
  }

  public registerSummary(
    type: metricType,
    name: string,
    help: string,
    labelNames?: string[],
    options?: Partial<SummaryConfiguration<string>>
  ): SummaryType<string> {
    const config = this.baseConfig(type, name, help, labelNames);
    return new Summary({ ...config, ...options });
  }

  public getMetric(type: metricType, name) {
    const fullName = this.fullName(type, name);
    return this.registry.getSingleMetric(fullName);
  }

  public metrics() {
    return this.registry.metrics();
  }

  public get contentType() {
    return this.registry.contentType;
  }

  public push(): Promise<void> {
    if (!this.gateway) {
      return Promise.reject(new Error('Pushgateway not configured'));
    }
    const params = { jobName: this.appName };
    return new Promise((resolve, reject) => {
      this.gateway.push(params, (err, resp, body) => {
        if (err) {
          Object.assign(err, { context: body });
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
