import * as Honeybadger from '@honeybadger-io/js';

const Levels = require('log4js/lib/levels');
const log4jsErrorLevel = Levels.ERROR.level;

function notifyHoneybadger(categoryName, error, ...rest) {
  if (!error) return;
  error = buildError(error, rest);

  let context = buildContext(rest);
  let payload = buildPayload(categoryName, error, context);

  Honeybadger.notify(error, payload);
}

function buildError(error: Error | string, rest: any[]) {
  if (typeof error === 'string') {
    error = new Error(error);
  }

  const message = rest.filter(r => typeof r === 'string').join('. ');
  if (message) error.message = `${error.message}. ${message}`;

  return error;
}

function buildContext(rest: any[]) {
  return rest.filter(r => typeof r !== 'string').reduce((acc, r) => Object.assign(acc, r), {});
}

function buildPayload(categoryName, error, context) {
  let actionFallback = context.action;
  let componentFallback = context.component || categoryName;

  delete context.action;
  delete context.component;

  let { headers = {}, params = {} } = error;
  error.action ||= actionFallback;
  error.component ||= componentFallback;

  Object.assign(context, error.context);
  Object.assign(headers, context.headers);
  Object.assign(params, context.params);

  const fingerprint = generateFingerprint(categoryName, error, context);
  delete context.fingerprint;

  return {
    context,
    headers,
    cgiData: {
      'server-software': `Node ${process.version}`
    },
    action: error.action,
    component: error.component,
    params,
    fingerprint
  };
}

const generateFingerprint = (categoryName, error, context) => {
  if (context.fingerprint) return context.fingerprint;
  const action = error.action;
  const component = error.component;
  const name = error.name;

  if (!action || !component) return categoryName;

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
