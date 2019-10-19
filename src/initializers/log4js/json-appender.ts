import * as lodash from 'lodash';
import * as rTracer from 'cls-rtracer';

const jsonAppender = () => {
  return logEvent => {
    let event = logEvent.level.levelStr === 'ERROR' ? createErrorLog(logEvent) : createValidLog(logEvent);
    var json = JSON.stringify(event);
    console.log(json);
  };
};

export const createErrorLog = logEvent => {
  const { context: _context, data: _data } = logEvent;
  const data = lodash.flattenDeep(_data);
  const trace = rTracer.id();

  const context = {
    ...getContextObject(data),
    ..._context,
    ...(trace ? { trace } : {})
  };

  return {
    timestamp: logEvent.startTime,
    severity: logEvent.level.levelStr,
    categoryName: logEvent.categoryName,
    message: logEvent.data[0].message,
    stack_trace: logEvent.data[0].stack,
    context
  };
};

export const createValidLog = logEvent => {
  const { context: _context = {}, data: _data } = logEvent;
  const data = lodash.flattenDeep(_data);
  const trace = rTracer.id();

  const context = {
    ...getContextObject(data),
    ..._context,
    ...(trace ? { trace } : {})
  };
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
