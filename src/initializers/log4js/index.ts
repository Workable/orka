import * as Log4js from 'log4js';
import * as path from 'path';

let tmp = name => {
  const logger = Log4js.getLogger('initializing.' + name);
  logger.level = 'trace';
  return logger;
};

export let getLogger = name => {
  return tmp(name);
};

export default async config => {
  const appenders = {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: config.log.pattern
      }
    }
  } as any;

  const appendersList = ['console'];

  if (config.honeybadgerApiKey) {
    appenders.honeybadger = {
      type: path.resolve(path.join(__dirname, './honeybadger-appender'))
    };
    appendersList.push('honeybadger');
  }

  Log4js.configure({
    appenders,
    categories: {
      default: {
        appenders: appendersList,
        level: config.log.level
      }
    }
  });

  tmp = Log4js.getLogger.bind(Log4js);
};
