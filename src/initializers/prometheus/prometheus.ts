import requireInjected from '../../require-injected';
import { Registry as RegistryType, Metric, Pushgateway as PushgatewayType } from '../../typings/prometheus';
const { Registry, Counter, Gauge, Pushgateway } = requireInjected('prom-client');
import { snakeCase } from 'lodash';

export default class Prometheus {
  private registry: RegistryType;
  private prefix: string;
  private gatewayUrl: string;
  private gateway: PushgatewayType;

  constructor(prefix: string, gatewayUrl?: string) {
    this.registry = new Registry();
    this.prefix = prefix;
    this.gatewayUrl = gatewayUrl;
    if (this.gatewayUrl) {
      this.gateway = new Pushgateway(this.gatewayUrl, {}, this.registry);
    }
  }

  private baseConfig(name: string, help: string, labelNames?: string[]) {
    const fullName = snakeCase(`${this.prefix}_${name}`);
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

  public registerCounter(name: string, help: string, labelNames?: string[]): Metric<string> {
    const config = this.baseConfig(name, help, labelNames);
    return new Counter(config);
  }

  public registerGauge(name: string, help: string, labelNames?: string[]): Metric<string> {
    const config = this.baseConfig(name, help, labelNames);
    return new Gauge(config);
  }

  public getMetric(name) {
    const fullName = snakeCase(`${this.prefix}_${name}`);
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
    const params = { jobName: this.prefix };
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
