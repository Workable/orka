export default async (config) => {
  if (config.honeybadger.apiKey) {
    const honeybadger = await import('@honeybadger-io/js');
    honeybadger.configure({
      environment: config.app.env,
      developmentEnvironments: config.honeybadger.developmentEnvironments
    });
  }
};
