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
      enabled: true,
      https: true,
      level: 'info'
    },
    traceHeaderName: config.traceHeaderName
  });
