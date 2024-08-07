import * as lodash from 'lodash';
import { getRequestContext } from '../../builder';
import { injectTrace } from '../datadog';

const jsonAppender = (layout, config) => {
  return logEvent => {
    let isLevelError = logEvent.level.levelStr === 'ERROR';
    let isFirstElemError = logEvent?.data?.[0] instanceof Error;
    let event =
      isLevelError || isFirstElemError
        ? createErrorLog(layout, logEvent, config)
        : createValidLog(layout, logEvent, config);
    let json = '';
    try {
      injectTrace(event);
      json = JSON.stringify(event);
    } catch (error) {
      let seen = new WeakSet();

      const circularJson = JSON.stringify(event, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return 'circular_ref';
          }
          seen.add(value);
        }
        return value;
      });

      seen = null;
      json = circularJson;
    }
    console.log(json);
  };
};

const requestContextKeys = config =>
  lodash.pick(Object.fromEntries(getRequestContext() || new Map()), config?.logKeys || []);

export const createErrorLog = (layout, logEvent, config) => {
  const data = lodash.flattenDeep(logEvent.data);

  const context = { ...requestContextKeys(config), ...getContextObject(data) };
  const message = getMessageObject(layout, data);

  return {
    timestamp: logEvent.startTime,
    severity: logEvent.level.levelStr,
    categoryName: logEvent.categoryName,
    message: logEvent.data[0]?.message + (message ? ' - ' + message : ''),
    stack_trace: logEvent.data[0]?.stack,
    context
  };
};

export const createValidLog = (layout, logEvent, config) => {
  const data = lodash.flattenDeep(logEvent.data);
  const context = { ...requestContextKeys(config), ...getContextObject(data) };
  const message = getMessageObject(layout, data);

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

const getMessageObject = (layout, data) => {
  return layout({ data: data.filter(element => typeof element !== 'object') });
};

export function configure(config: any, layouts: { messagePassThroughLayout: any }) {
  const layout = layouts.messagePassThroughLayout;
  return jsonAppender(layout, config);
}
