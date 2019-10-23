import * as lodash from 'lodash';

const jsonAppender = layout => {
  return logEvent => {
    let event = logEvent.level.levelStr === 'ERROR' ? createErrorLog(logEvent) : createValidLog(layout, logEvent);
    var json = JSON.stringify(event);
    console.log(json);
  };
};

export const createErrorLog = logEvent => {
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

export const createValidLog = (layout, logEvent) => {
  const data = lodash.flattenDeep(logEvent.data);

  const context = getContextObject(data);
  const message = layout(logEvent);

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

function configure(config, layouts) {
  let layout = layouts.messagePassThroughLayout;
  return jsonAppender(layout);
}

module.exports.configure = configure;

// export function configure() {
//   return jsonAppender();
// }
