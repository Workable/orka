import { riviere } from '@workablehr/riviere';
import { OrkaOptions } from 'orka/typings/orka';
import * as Koa from 'koa';

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
      level: 'info',
      maxBodyValueChars: config.riviere.maxBodyValueChars
    },
    inbound: {
      level: 'info',
      enabled: config.riviere.enabled,
      request: {
        enabled: config.riviere.inbound.request.enabled
      },
      maxBodyValueChars: config.riviere.maxBodyValueChars
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
    context: (ctx: Koa.Context) => {
      return {
        visitor: ctx.state.visitor,
        ...orkaOptions.riviereContext(ctx)
      };
    }
  });
