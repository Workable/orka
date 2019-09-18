import { riviere } from '@workablehr/riviere';

export default config =>
  riviere({
    forceIds: true,
    styles: config.riviere.styles,
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
      enabled: config.riviere.enabled
    } as any,
    errors: {
      enabled: config.riviere.enabled
    } as any,
    headersRegex: new RegExp(config.riviere.headersRegex, 'i'),
    traceHeaderName: config.traceHeaderName
  });
