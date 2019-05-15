export default async (config, orkaOptions) => {
  if (config.honeybadgerApiKey) {
    const honeybadger = await import('honeybadger');
    honeybadger.configure({
      environment: config.nodeEnv,
      developmentEnvironments: orkaOptions.honeyBadger.developmentEnvironments
    });
  }
};
