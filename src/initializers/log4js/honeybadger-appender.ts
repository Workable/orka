import * as Honeybadger from 'honeybadger';

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

  console.log(`name: ${name}`);
  console.log(`error.message: ${error.message}`);
  console.log(`component: ${component}`);
  console.log(`categoryName: ${categoryName}`);
  console.log(`action: ${action}`);
  console.log(`computed: ${computedComponent}`);
  console.log(`fingerprint: ${action && computedComponent ? `${computedComponent}_${action}` : categoryName}`);

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
      fingerprint: action && computedComponent ? `${computedComponent}_${action}` : categoryName
    }
  );
}

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
