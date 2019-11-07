import * as lodash from 'lodash';
import safeStringify from '../../helpers/jsonUtils';

const jsonAppender = layout => {
  return logEvent => {
    let event =
      logEvent.level.levelStr === 'ERROR' ? createErrorLog(layout, logEvent) : createValidLog(layout, logEvent);
    const json = safeStringify(event);
    console.log(json);
  };
};

export const createErrorLog = (layout, logEvent) => {
  const data = lodash.flattenDeep(logEvent.data);

  const context = getContextObject(data);
  const message = getMessageObject(layout, data);

  return {
    timestamp: logEvent.startTime,
    severity: logEvent.level.levelStr,
    categoryName: logEvent.categoryName,
    message: logEvent.data[0].message + (message ? ' - ' + message : ''),
    stack_trace: logEvent.data[0].stack,
    context
  };
};

export const createValidLog = (layout, logEvent) => {
  const data = lodash.flattenDeep(logEvent.data);

  const context = getContextObject(data);
  const message = getMessageObject(layout, data);

  return {
    timestamp: logEvent.startTime,
    severity: logEvent.level.levelStr,
    categoryName: logEvent.categoryName,
    message,
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

const getMessageObject = (layout, data) => {
  return layout({ data: data.filter(element => typeof element !== 'object') });
};

export function configure(config: any, layouts: { messagePassThroughLayout: any }) {
  const layout = layouts.messagePassThroughLayout;
  return jsonAppender(layout);
}
