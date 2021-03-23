import { pick } from 'lodash';
import * as Log4js from 'log4js';
import * as path from 'path';
import { getRequestContext } from '../../builder';

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
          logTracer: () => {
            const tracerObject = pick(
              Object.fromEntries(getRequestContext() || new Map()),
              config.requestContext.logKeys
            );
            const values = Object.values(tracerObject);
            if (!values.length) return '';
            return values.map(v => `[${v}]`).join(' ');
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
