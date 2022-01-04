export default async config => {
  if (config.honeybadger.apiKey) {
    const honeybadger = await import('@honeybadger-io/js');
    honeybadger.configure({
      apiKey: config.honeybadger.apiKey,
      environment: config.app.env,
      developmentEnvironments: config.honeybadger.developmentEnvironments
    });
    honeybadger.beforeNotify(function (notice) {
      if (notice.backtrace.length > 0) {
        notice.fingerprint += `_${notice.backtrace[0].file}_${notice.backtrace[0].number}`;
      }
    });
  }
};
