import * as sinon from 'sinon';
import { Context } from 'koa';
import { default as getRootSpan } from '../../src/helpers/get-root-span';
import should = require('should');
import * as datadog from '../../src/initializers/datadog/index';

const sandbox = sinon.createSandbox();

describe.only('Test get-root-span helper', function () {
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
  });
});
