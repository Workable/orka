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
  // TODO: Remove this conversion logic after v5.x.x release
  const logger = getLogger('orka.riviere');
  const regexKeys = ['headersRegex', 'bodyKeysRegex'];
  regexKeys.forEach(key => {
    if (typeof config?.riviere[key] === 'string') {
      logger.warn(
        `You are using a string for regex key ${key} in riviere config. This will not be supported after Orka v5.x.x. Please use a RegExp object.`
      );
      config.riviere[key] = new RegExp(config.riviere[key], 'i');
    }
  });

  if (typeof config?.riviere?.outbound?.blacklistedPathRegex === 'string') {
    logger.warn(
      `You are using a string for regex key outbound.blacklistedPathRegex in riviere config. This will not be supported after Orka v5.x.x. Please use a RegExp object.`
    );
    config.riviere.outbound.blacklistedPathRegex = new RegExp(config.riviere.outbound.blacklistedPathRegex, 'i');
  }

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
    headersRegex: config.riviere.headersRegex,
    traceHeaderName: config.traceHeaderName,
    styles: config.riviere.styles,
    bodyKeys: config.riviere.bodyKeys,
    bodyKeysRegex: config.riviere.bodyKeysRegex,
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
      const args = [...argumentsList];
      try {
        // http.request supports two signatures:
        // - http.request(options[, callback])
        // - http.request(url[, options][, callback])
        // Find the options object based on the first argument type
        let optionsIndex = 0;
        const firstArg = args[0];
        if (typeof firstArg === 'string' || firstArg instanceof URL) {
          optionsIndex = 1;
          if (!args[1] || typeof args[1] === 'function') {
            args.splice(1, 0, {});
          }
        }
        const requestArgs = args[optionsIndex] || {};
        if (typeof requestArgs === 'object' && requestArgs !== null) {
          requestArgs.headers = requestArgs.headers || {};
          const traceHeaderName = config.traceHeaderName && config.traceHeaderName.toLowerCase();
          const traceId = getRequestContext()?.get('requestId') || getRequestContext()?.get('correlationId');
          appendHeadersFromStore(requestArgs, getRequestContext(), config);
          if (!requestArgs.headers[traceHeaderName] && traceId) {
            requestArgs.headers[traceHeaderName] = traceId;
          }
        }
      } catch (e) {
        getLogger('orka.riviere').error(e);
      }
      return target.apply(thisArg, args);
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
