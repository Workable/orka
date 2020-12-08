import { getLogger } from '../../../src/initializers/log4js';
import init, { getPrometheus } from '../../../src/initializers/prometheus/index';
import should = require('should');
import * as sinon from 'sinon';
const sandbox = sinon.createSandbox();

describe('prometheus init', () => {
  const appName = 'My Test App';

  afterEach(() => {
    sandbox.restore();
  });

  describe('when configuration is missing', () => {
    it('should return undefined and log error', async () => {
      const logger = getLogger('orka.initializers.prometheus');
      const logSpy = sandbox.spy(logger, 'error');
      await init({} as any, appName);
      should(getPrometheus()).be.undefined();
      sandbox.assert.calledOnce(logSpy);
      should(logSpy.args[0][0].message).equal('prometheus is not initialized');
    });
  });
  describe('when enabled', () => {
    const config = {
      prometheus: {
        enabled: true
      }
    };
    it('should return a prometheus instance without gateway', async () => {
      await init(config, appName);
      const prom = getPrometheus();
      should(prom).not.be.undefined();
      prom['appName'].should.equal('my_test_app');
      should(prom['gateway']).be.undefined();
    });
  });
  describe('when enabled with pushgateway', () => {
    const configWithGateway = {
      prometheus: {
        enabled: true,
        gatewayUrl: 'http://somehost.local'
      }
    };
    it('should return a prometheus instance with gateway', async () => {
      await init(configWithGateway, appName);
      const prom = getPrometheus();
      should(prom).not.be.undefined();
      should(prom['gateway']).not.be.undefined();
      prom['appName'].should.equal('my_test_app');
      prom['gateway']['gatewayUrl'].should.equal('http://somehost.local');
    });
  });
});
