export default async (config, options) => {
  if (config.honeybadgerApiKey) {
    const honeybadger = await import('honeybadger');
    honeybadger.configure({
      environment: config.nodeEnv,
      developmentEnvironments: options.developmentEnvironments
    });
  }
};
