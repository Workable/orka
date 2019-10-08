import * as Honeybadger from 'honeybadger';

const Levels = require('log4js/lib/levels');
const log4jsErrorLevel = Levels.ERROR.level;

function notifyHoneybadger(filter_status, name, error, ...rest) {
  if (typeof error === 'string') {
    error = new Error(error);
  }

  if (!error) {
    return;
  }

  if (error && error.status && filter_status.indexOf(error.status) !== -1) {
    return;
  }

  let context = {} as any;
  let message = error.message;
  rest.forEach(r => {
    if (typeof r === 'string') {
      message += `. ${r}`;
    } else {
      Object.assign(context, r);
    }
  });

  let actionFallback = context.action;
  let componentFallback = context.component;

  delete context.action;
  delete context.component;

  let { headers = {}, action = actionFallback, component = componentFallback, params = {} } = error;

  Object.assign(context, error.context);

  const computedComponent = component || name;

  Honeybadger.notify(
    { stack: error.stack, message },
    {
      context,
      headers,
      cgiData: {
        'server-software': `Node ${process.version}`
      },
      action,
      component: computedComponent,
      params,
      fingerprint: action && computedComponent ? `${computedComponent}_${action}` : name
    }
  );
}

const honeyBadgerAppender = (filter_status = []) => {
  return logEvent => {
    if (logEvent.level.level < log4jsErrorLevel) {
      return;
    }
    notifyHoneybadger.apply(this, [filter_status, logEvent.categoryName].concat(logEvent.data));
  };
};

export function configure(honeybadgerFilterStatus = []) {
  return honeyBadgerAppender(honeybadgerFilterStatus);
}
