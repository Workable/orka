import * as sinon from 'sinon';
import * as log4js from 'log4js';
import { Context } from 'koa';
import { default as getRootSpan } from '../../src/helpers/get-root-span';
import should = require('should');
import * as datadog from '../../src/initializers/datadog/index';

const sandbox = sinon.createSandbox();

describe('Test get-root-span helper', function () {
  before(function () {
    process.env.DD_SERVICE = 'true';
    process.env.DD_ENV = 'true';
  });

  after(function () {
    delete process.env.DD_SERVICE;
    delete process.env.DD_ENV;
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Test dd-trace until v2.2.0 with _datadog property', function () {
    it('should return span from req._datadog', function () {
      const stub = sandbox.stub();
      const ctx = ({
        req: { _datadog: { span: { value: 'mySpan' } } },
        request: { method: 'GET' }
      } as unknown) as Context;

      const span = getRootSpan(ctx);
      span.value.should.equal('mySpan');
    });
  });

  describe('Test dd-trace > v2.2.0 without _datadog property', function () {
    it('should return undefined if getDatadogTracer does not exist', function () {
      const ctx = ({ request: { method: 'GET' } } as unknown) as Context;
      const span = getRootSpan(ctx);
      should(span).be.undefined();
    });

    it('should return undefined if started array is empty', function () {
      const tracerStub = {
        scope: sandbox.stub().returns({
          active: sandbox.stub().returns({
            context: sandbox.stub().returns({ _trace: { started: [] } })
          })
        })
      };
      sandbox.stub(datadog, 'getDatadogTracer').returns(tracerStub as any);

      const ctx = ({ request: { method: 'GET' } } as unknown) as Context;
      const span = getRootSpan(ctx);
      should(span).be.undefined();
    });

    it('should return span from started array first value', function () {
      const tracerStub = {
        scope: sandbox.stub().returns({
          active: sandbox.stub().returns({
            context: sandbox.stub().returns({ _trace: { started: [{ value: 'mySpan' }, { value: 'test' }] } })
          })
        })
      };
      sandbox.stub(datadog, 'getDatadogTracer').returns(tracerStub as any);

      const ctx = ({ request: { method: 'GET' } } as unknown) as Context;
      const span = getRootSpan(ctx);
      span.value.should.equal('mySpan');
    });

    it('should log warning if tracer api changes', function () {
      const tracerStub = {
        newScope: sandbox.stub().returns({
          active: sandbox.stub().returns({
            context: sandbox.stub().returns({ _trace: { started: [{ value: 'mySpan' }, { value: 'test' }] } })
          })
        })
      };
      sandbox.stub(datadog, 'getDatadogTracer').returns(tracerStub as any);
      const loggerStub = sandbox.stub(log4js.getLogger('orka.helpers.get-root-span').constructor.prototype, 'error');

      const ctx = ({ request: { method: 'GET' } } as unknown) as Context;
      const span = getRootSpan(ctx);

      loggerStub.calledOnce.should.be.true();
      loggerStub.args[0][0].should.containEql('dd-trace error trying to find root span');
    });
  });
});
