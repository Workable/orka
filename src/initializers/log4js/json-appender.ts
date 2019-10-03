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

  const context = getContextObject(data);

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

  const context = getContextObject(data);
  const message = getMessageObject(data);

  return {
    timestamp: logEvent.startTime,
    severity: logEvent.level.levelStr,
    categoryName: logEvent.categoryName,
    message: message,
    context
  };
};

const getContextObject = data => {
  let context = {};
  data
    .filter(element => typeof element === 'object')
    .forEach(element => {
      Object.assign(context, element);
    });
  return context;
};

const getMessageObject = data => {
  return data.filter(element => typeof element !== 'object').join(' ');
};

export function configure() {
  return jsonAppender();
}
