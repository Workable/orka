import * as Riviere from 'riviere';

export default config =>
  Riviere.middleware({
    forceIds: true,
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
