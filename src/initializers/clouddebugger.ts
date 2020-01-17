import { OrkaOptions } from '../typings/orka';

export default ({ appName: service }: Partial<OrkaOptions>): Promise<void> =>
  Promise.resolve(process.env.npm_package_version)
    .catch(v => v || import(`${process.env.PWD}/package.json`).then(({ version }) => version))
    .catch(() => 'unknown')
    .then(version => {
      require('@google-cloud/debug-agent').start({
        serviceContext: {
          service,
          version
        },
        allowExpressions: true
      });
    });
