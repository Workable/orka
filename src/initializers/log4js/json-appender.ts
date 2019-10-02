import * as lodash from 'lodash';

const jsonAppender = ({ filter_status = [] }) => {
  return logEvent => {
    let event = logEvent.level.levelStr === 'ERROR' ? createErrorLog(logEvent) : createValidLog(logEvent);
    var json = JSON.stringify(event);
    console.log(json);
  };
};

const createErrorLog = logEvent => {
  return {
    timestamp: logEvent.startTime,
    severity: logEvent.level.levelStr,
    categoryName: logEvent.categoryName,
    message: logEvent.data[0].message,
    stack_trace: logEvent.data[0].stack
  };
};

const createValidLog = logEvent => {
  const data = lodash.flattenDeep(logEvent.data);
  const message = data
    .map(element => {
      return typeof element === 'object' ? JSON.stringify(element) : element;
    })
    .join(' ');

  return {
    timestamp: logEvent.startTime,
    severity: logEvent.level.levelStr,
    categoryName: logEvent.categoryName,
    message: message
  };
};

export function configure(config = {} as any) {
  const { filter_status = [] } = config;
  return jsonAppender({
    filter_status
  });
}
