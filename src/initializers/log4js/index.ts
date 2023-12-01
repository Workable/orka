import { pick, difference } from 'lodash';
import * as Log4js from 'log4js';
import * as path from 'path';
import { getRequestContext } from '../../builder';
import chalk from 'chalk';

let tmp = name => {
  const logger = Log4js.getLogger('initializing.' + name);
  logger.level = 'trace';
  return logger;
};

export let getLogger = (name: string) => {
  if (loggers[name]) return loggers[name] as Log4js.Logger;

  loggers[name] = tmp(name);
  return loggers[name] as Log4js.Logger;
};
const loggers = {};

export default async config => {
  let appenders = {} as any;
  let appendersList = [];

  if (config.log.console) {
    appenders.console = {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: config.log.pattern,
        tokens: {
          requestId: data => {
            const msg = data.data[0];
            const traceId = getTraceId(config);
            if (!traceId) return '';
            return msg?.startsWith && !msg?.startsWith(`[${traceId}`) ? chalk.gray(`[${traceId}] `) : '';
          },

          logTracer: data => {
            const tracerObject = pick(
              Object.fromEntries(getRequestContext() || new Map()),
              difference(config.requestContext.logKeys, ['requestId', 'correlationId'])
            );
            const entries = Object.entries(tracerObject);
            if (!entries.length) return '';

            const log = entries
              .map(([k, v]) => {
                if (typeof v === 'object') {
                  return toLog(
                    v,
                    `${k === 'propagatedHeaders' ? 'headers' : k}.`,
                    k === 'propagatedHeaders' && getTraceId(config)
                  );
                } else {
                  return `${k}="${v}"`;
                }
              })
              .join(', ');
            if (log) return chalk.gray(`| ${log}`);
            return '';
          }
        }
      }
    };
    appendersList.push('console');
  }

  if (config.honeybadger.apiKey) {
    appenders.honeybadger = {
      type: path.resolve(path.join(__dirname, './honeybadger-appender'))
    };
    appendersList.push('honeybadger');
  }

  if (config.log.json) {
    appenders.json = {
      type: path.resolve(path.join(__dirname, './json-appender')),
      logKeys: config.requestContext.logKeys || []
    };
    appendersList.push('json');
  }

  Log4js.configure({
    appenders,
    categories: {
      default: {
        appenders: appendersList,
        level: config.log.level
      },
      'orka.kafka.consumer': {
        appenders: appendersList,
        level: (config.kafka && config.kafka.log && config.kafka.log.level) || config.log.level
      },
      'orka.kafka.producer': {
        appenders: appendersList,
        level: (config.kafka && config.kafka.log && config.kafka.log.level) || config.log.level
      }
    }
  });

  tmp = Log4js.getLogger.bind(Log4js);
};

function toLog(obj, prefix = '', traceId) {
  return Object.entries(obj)
    .filter(([k, v]) => v !== traceId)
    .map(([k, v]) => `${prefix}${k}="${v}"`)
    .join(', ');
}

function getTraceId(config) {
  let traceId;
  if (config.requestContext.logKeys.includes('requestId')) {
    traceId = traceId ?? getRequestContext()?.get('requestId');
  }
  if (config.requestContext.logKeys.includes('correlationId')) {
    traceId = traceId ?? getRequestContext()?.get('correlationId');
  }
  return traceId;
}
