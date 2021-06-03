const mock = require('mock-require');
import * as sinon from 'sinon';
import 'should';

const sandbox = sinon.createSandbox();

describe('Test postgres connection', function () {
  const config = {
    postgres: {
      url: 'postgres://localhost'
    }
  };
  let postgres;
  let poolStub: sinon.SinonSpy;

  beforeEach(async function () {
    poolStub = sandbox.stub().returns({ on: sandbox.stub() });
    delete require.cache[require.resolve('../../src/initializers/postgres')];
    mock('pg', { Pool: poolStub });
    ({ default: postgres } = await import('../../src/initializers/postgres'));
  });

  afterEach(function () {
    sandbox.restore();
    mock.stopAll();
  });

  it('should connect to postgres', () => {
    postgres(config);
    poolStub.callCount.should.equal(1);
  });

  it('should not connect to postgres with no config', () => {
    postgres({});
    poolStub.called.should.be.false();
  });

  it('should use ssl to connect to postgres', () => {
    postgres({
      postgres: {
        url: 'postgres://localhost',
        useSsl: true,
        sslConfig: {
          rejectUnauthorized: false
        }
      }
    });
    poolStub.args.should.eql([
      [
        {
          connectionString: 'postgres://localhost',
          max: undefined,
          ssl: { rejectUnauthorized: false }
        }
      ]
    ]);
  });

  it('should use ssl to connect to postgres', () => {
    postgres({
      postgres: {
        url: 'postgres://localhost',
        useSsl: false,
        sslConfig: {
          rejectUnauthorized: false
        }
      }
    });
    poolStub.args.should.eql([
      [
        {
          connectionString: 'postgres://localhost',
          max: undefined,
          ssl: undefined
        }
      ]
    ]);
  });
});
