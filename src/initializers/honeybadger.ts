export default async (config, orkaOptions) => {
  if (config.honeyBadgerApiKey) {
    const honeybadger = await import('honeybadger');
    honeybadger.configure({
      environment: config.nodeEnv,
      developmentEnvironments: orkaOptions.honeyBadger.developmentEnvironments
    });
  }
};
