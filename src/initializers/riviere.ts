import { riviere } from '@workablehr/riviere';
import { OrkaOptions } from 'orka/typings/orka';
import * as Koa from 'koa';
import { getRequestContext } from '../builder';
import { getLogger } from './log4js';
import { appendHeadersFromStore } from '../utils';
import { injectTrace } from '../initializers/datadog';
const http = require('http');
const https = require('https');

let middleware;

const init = (config, orkaOptions) => {
  middleware = riviere({
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
      maxBodyValueChars: config.riviere.maxBodyValueChars,
      blacklistedPathRegex: config.riviere.outbound && config.riviere.outbound.blacklistedPathRegex,
      request: {
        enabled: config.riviere.outbound && config.riviere.outbound.request.enabled
      },
      ...config.riviere.outbound
    },
    inbound: {
      level: 'info',
      enabled: config.riviere.enabled,
      request: {
        enabled: config.riviere.inbound.request.enabled
      },
      maxBodyValueChars: config.riviere.maxBodyValueChars,
      ...config.riviere.inbound
    } as any,
    errors: {
      enabled: config.riviere.enabled
    } as any,
    headersRegex: new RegExp(config.riviere.headersRegex, 'i'),
    traceHeaderName: config.traceHeaderName,
    styles: config.riviere.styles,
    bodyKeys: config.riviere.bodyKeys,
    bodyKeysRegex: config.riviere.bodyKeysRegex && new RegExp(config.riviere.bodyKeysRegex, 'i'),
    bodyKeysCallback: config.riviere.bodyKeysCallback,
    color: config.riviere.color,
    hostFieldName: config.riviere.hostFieldName,
    loggerCallback: injectTrace,
    context: (ctx: Koa.Context) => {
      return {
        visitor: ctx.state.visitor,
        ...orkaOptions.riviereContext(ctx)
      };
    }
  });
  const handler = {
    apply: (target, thisArg, argumentsList) => {
      try {
        const [requestArgs = {}] = argumentsList || [];
        requestArgs.headers = requestArgs.headers || {};
        const traceHeaderName = config.traceHeaderName && config.traceHeaderName.toLowerCase();
        const traceId = getRequestContext()?.get('requestId') || getRequestContext()?.get('correlationId');
        appendHeadersFromStore(requestArgs, getRequestContext(), config);
        if (!requestArgs.headers[traceHeaderName] && traceId) {
          requestArgs.headers[traceHeaderName] = traceId;
        }
      } catch (e) {
        getLogger('orka.riviere').error(e);
      }
      return target.apply(thisArg, argumentsList);
    }
  };
  http.request = new Proxy(http.request, handler);
  https.request = new Proxy(https.request, handler);
};

export default (config, orkaOptions: Partial<OrkaOptions>) => {
  if (!middleware) {
    getLogger('initializing.orka').info('Initializing riviere...');
    init(config, orkaOptions);
  }
  return middleware;
};
