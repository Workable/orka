import { riviere } from '@workablehr/riviere';

export default config =>
  riviere({
    forceIds: true,
    styles: ['extended', 'json'],
    health: [
      {
        method: 'GET',
        path: '/health'
      }
    ],
    outbound: {
      enabled: config.riviere,
      https: true,
      level: 'info'
    },
    inbound: {
      level: 'info',
      enabled: config.riviere
    } as any,
    errors: {
      enabled: config.riviere
    } as any,
    headersRegex: new RegExp(config.headersRegex, 'i'),
    traceHeaderName: config.traceHeaderName
  });
