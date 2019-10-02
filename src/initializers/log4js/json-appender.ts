import * as lodash from 'lodash';

const jsonAppender = () => {
  return logEvent => {
    let event = logEvent.level.levelStr === 'ERROR' ? createErrorLog(logEvent) : createValidLog(logEvent);
    var json = JSON.stringify(event);
    console.log(json);
  };
};

const createErrorLog = logEvent => {
  const data = lodash.flattenDeep(logEvent.data);
  let context = {};
  data.forEach(element => {
    if (typeof element === 'object') {
      Object.assign(context, element);
    }
  });

  return {
    timestamp: logEvent.startTime,
    severity: logEvent.level.levelStr,
    categoryName: logEvent.categoryName,
    message: logEvent.data[0].message,
    stack_trace: logEvent.data[0].stack,
    context
  };
};

const createValidLog = logEvent => {
  const data = lodash.flattenDeep(logEvent.data);
  let context = {};
  const message = data
    .map(element => {
      if (typeof element === 'object') {
        Object.assign(context, element);
      } else {
        return element;
      }
    })
    .join(' ');

  return {
    timestamp: logEvent.startTime,
    severity: logEvent.level.levelStr,
    categoryName: logEvent.categoryName,
    message: message,
    context
  };
};

export function configure() {
  return jsonAppender();
}
