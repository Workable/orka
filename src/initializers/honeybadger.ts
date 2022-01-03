export default async config => {
  if (config.honeybadger.apiKey) {
    const honeybadger = await import('@honeybadger-io/js');
    honeybadger.configure({
      apiKey: config.honeybadger.apiKey,
      environment: config.app.env,
      developmentEnvironments: config.honeybadger.developmentEnvironments
    });
    honeybadger.beforeNotify(function (notice) {
      // For testing purposes. Will delete after
      console.log(`fingerprint before: ${notice.fingerprint}`);

      if (notice.backtrace.length > 0) {
        notice.fingerprint += `_${notice.backtrace[0].file}_${notice.backtrace[0].number}`;
      }
      console.log(`fingerprint after: ${notice.fingerprint}`);
    });
  }
};
