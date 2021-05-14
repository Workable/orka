import * as sinon from 'sinon';
import OrkaBuilder from '../src/orka-builder';
import orka from '../src/orka';

const sandbox = sinon.createSandbox();

describe('Orka', function() {
  let builderStub;
  beforeEach(function() {
    builderStub = sandbox.createStubInstance(OrkaBuilder);
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('initializes orka', function() {
    builderStub.forTypescript.returns(builderStub);
    builderStub.use.returns(builderStub);
    builderStub.useDefaults.returns(builderStub);
    builderStub.withCloudDebugger.returns(builderStub);
    builderStub.withLogo.returns(builderStub);
    builderStub.withRabbitMQ.returns(builderStub);
    builderStub.withHoneyBadger.returns(builderStub);
    builderStub.withKafka.returns(builderStub);
    builderStub.withMongoDB.returns(builderStub);
    builderStub.withBull.returns(builderStub);
    builderStub.withPrometheus.returns(builderStub);
    builderStub.withRedis.returns(builderStub);
    builderStub.withPostgres.returns(builderStub);
    builderStub.with.returns(builderStub);
    builderStub.routes.returns(builderStub);

    const stub = sandbox.stub();
    orka({
      builder: builderStub,
      beforeMiddleware: stub,
      afterMiddleware: stub,
      logoPath: 'logoPath',
      rabbitOnConnected: stub,
      mongoOnConnected: stub,
      routesPath: 'routes'
    });

    builderStub.forTypescript.args.should.eql([[false]]);
    builderStub.use.args.should.eql([[stub], [stub]]);
    builderStub.useDefaults.args.should.eql([[]]);
    builderStub.withCloudDebugger.args.should.eql([[]]);
    builderStub.withLogo.args.should.eql([['logoPath']]);
    builderStub.withRabbitMQ.args.should.eql([[stub]]);
    builderStub.withHoneyBadger.args.should.eql([[]]);
    builderStub.withKafka.args.should.eql([[]]);
    builderStub.withMongoDB.args.should.eql([[stub]]);
    builderStub.withRedis.args.should.eql([[]]);
    builderStub.withPostgres.returns([[]]);
    builderStub.with.args.should.eql([[[]]]);
    builderStub.routes.args.should.eql([['routes']]);
  });
});
