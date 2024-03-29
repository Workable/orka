import * as Honeybadger from '@honeybadger-io/js';

const Levels = require('log4js/lib/levels');
const log4jsErrorLevel = Levels.ERROR.level;

function notifyHoneybadger(categoryName, error, ...rest) {
  if (typeof error === 'string') {
    error = new Error(error);
  }

  if (!error) {
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

  let { headers = {}, action = actionFallback, component = componentFallback, params = {}, name } = error;

  Object.assign(context, error.context);

  const computedComponent = component || categoryName;

  const fingerprint = context.fingerprint || generateFingerprint(name, computedComponent, action) || categoryName;
  delete context.fingerprint;

  Honeybadger.notify(
    { stack: error.stack, message, name },
    {
      context,
      headers,
      cgiData: {
        'server-software': `Node ${process.version}`
      },
      action,
      component: computedComponent,
      params,
      fingerprint
    }
  );
}

const generateFingerprint = (name, component, action) => {
  if (!action || !component) {
    return;
  }

  if (name && name !== 'Error') {
    return `${name}_${component}_${action}`;
  } else {
    return `${component}_${action}`;
  }
};

const honeyBadgerAppender = () => {
  return logEvent => {
    if (logEvent.level.level < log4jsErrorLevel) {
      return;
    }
    notifyHoneybadger.apply(this, [logEvent.categoryName].concat(logEvent.data));
  };
};

export function configure() {
  return honeyBadgerAppender();
}
