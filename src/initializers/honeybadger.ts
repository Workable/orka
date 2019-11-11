export default async (config, options) => {
  if (config.honeybadger.apiKey) {
    const honeybadger = await import('honeybadger');
    honeybadger.configure({
      environment: config.app.env,
      developmentEnvironments: options.developmentEnvironments
    });
  }
};
