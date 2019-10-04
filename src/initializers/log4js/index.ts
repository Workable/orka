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
  let appenders = {} as any;
  let appendersList = [];

  if (config.log.consoleLogging) {
    appenders.console = {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: config.log.pattern
      }
    };
    appendersList.push('console');
  }

  if (config.honeybadger.apiKey) {
    appenders.honeybadger = {
      type: path.resolve(path.join(__dirname, './honeybadger-appender')),
      filter_status: config.honeybadger.filterStatus
    };
    appendersList.push('honeybadger');
  }

  if (config.log.jsonLogging) {
    appenders.json = {
      type: path.resolve(path.join(__dirname, './json-appender'))
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
      'orka.kafka.consumer.internal': {
        appenders: appendersList,
        level: (config.kafka && config.kafka.log && config.kafka.log.level) || config.log.level
      },
      'orka.kafka.producer.internal': {
        appenders: appendersList,
        level: (config.kafka && config.kafka.log && config.kafka.log.level) || config.log.level
      }
    }
  });

  tmp = Log4js.getLogger.bind(Log4js);
};
