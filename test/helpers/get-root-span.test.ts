import { describe, it, before, after, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import * as log4js from 'log4js';
import { Context } from 'koa';
import { default as getRootSpan } from '../../src/helpers/get-root-span';
import * as datadog from '../../src/initializers/datadog/index';

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
    mock.restoreAll();
  });

  describe('Test dd-trace until v2.2.0 with _datadog property', function () {
    it('should return span from req._datadog', function () {
      const ctx = ({
        req: { _datadog: { span: { value: 'mySpan' } } },
        request: { method: 'GET' }
      } as unknown) as Context;

      const span = getRootSpan(ctx);
      assert.strictEqual((span as any).value, 'mySpan');
    });
  });

  describe('Test dd-trace > v2.2.0 without _datadog property', function () {
    it('should return undefined if getDatadogTracer does not exist', function () {
      const ctx = ({ request: { method: 'GET' } } as unknown) as Context;
      const span = getRootSpan(ctx);
      assert.strictEqual(span, undefined);
    });

    it('should return undefined if started array is empty', function () {
      const tracerStub = {
        scope: mock.fn(() => ({
          active: mock.fn(() => ({
            context: mock.fn(() => ({ _trace: { started: [] } }))
          }))
        }))
      };
      mock.method(datadog, 'getDatadogTracer', () => tracerStub as any);

      const ctx = ({ request: { method: 'GET' } } as unknown) as Context;
      const span = getRootSpan(ctx);
      assert.strictEqual(span, undefined);
    });

    it('should return span from started array first value', function () {
      const tracerStub = {
        scope: mock.fn(() => ({
          active: mock.fn(() => ({
            context: mock.fn(() => ({ _trace: { started: [{ value: 'mySpan' }, { value: 'test' }] } }))
          }))
        }))
      };
      mock.method(datadog, 'getDatadogTracer', () => tracerStub as any);

      const ctx = ({ request: { method: 'GET' } } as unknown) as Context;
      const span = getRootSpan(ctx);
      assert.strictEqual((span as any).value, 'mySpan');
    });

    it('should log warning if tracer api changes', function () {
      const tracerStub = {
        newScope: mock.fn(() => ({
          active: mock.fn(() => ({
            context: mock.fn(() => ({ _trace: { started: [{ value: 'mySpan' }, { value: 'test' }] } }))
          }))
        }))
      };
      mock.method(datadog, 'getDatadogTracer', () => tracerStub as any);
      const loggerStub = mock.method(log4js.getLogger('orka.helpers.get-root-span').constructor.prototype, 'error');

      const ctx = ({ request: { method: 'GET' } } as unknown) as Context;
      const span = getRootSpan(ctx);

      assert.strictEqual(loggerStub.mock.callCount(), 1);
      assert.ok((loggerStub.mock.calls[0].arguments[1] as string).includes('dd-trace error trying to find root span'));
    });
  });
});
