import { riviere } from '@workablehr/riviere';
import { OrkaOptions } from 'orka/typings/orka';

export default (config, orkaOptions: Partial<OrkaOptions>) =>
  riviere({
    forceIds: true,
    health: [
      {
        method: 'GET',
        path: '/health'
      }
    ],
    outbound: {
      enabled: config.riviere.enabled,
      https: true,
      level: 'info'
    },
    inbound: {
      level: 'info',
      enabled: config.riviere.enabled,
      request: {
        enabled: config.riviere.inbound.request.enabled
      }
    } as any,
    errors: {
      enabled: config.riviere.enabled
    } as any,
    headersRegex: new RegExp(config.riviere.headersRegex, 'i'),
    traceHeaderName: config.traceHeaderName,
    styles: config.riviere.styles,
    bodyKeys: config.riviere.bodyKeys,
    bodyKeysRegex: config.riviere.bodyKeysRegex && new RegExp(config.riviere.bodyKeysRegex, 'i'),
    color: config.riviere.color,
    context: orkaOptions.riviereContext
  });
