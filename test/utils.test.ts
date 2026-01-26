import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { appendHeadersFromStore, appendToStore, nodeVersionGreaterThanEqual } from '../src/utils';
import { cloneDeep } from 'lodash';
import * as crypto from 'crypto';

describe('utils', function () {
  describe('nodeVersionGreaterThanEqual', function () {
    const version = 'v10.11.5';

    it('major greater than', function () {
      assert.strictEqual(nodeVersionGreaterThanEqual('v9.12.0', version), true);
    });
    it('major less than', function () {
      assert.strictEqual(nodeVersionGreaterThanEqual('v11.1.0', version), false);
    });
    it('minor greater than', function () {
      assert.strictEqual(nodeVersionGreaterThanEqual('v10.5.0', version), true);
    });
    it('minor less than', function () {
      assert.strictEqual(nodeVersionGreaterThanEqual('v10.12.0', version), false);
    });
    it('patch greater than', function () {
      assert.strictEqual(nodeVersionGreaterThanEqual('v10.11.1', version), true);
    });
    it('patch less than', function () {
      assert.strictEqual(nodeVersionGreaterThanEqual('v10.11.7', version), false);
    });
    it('equal version', function () {
      assert.strictEqual(nodeVersionGreaterThanEqual('v10.11.5', version), true);
    });
  });

  describe('appendHeadersFromStore', function () {
    const Config = {
      traceHeaderName: 'foo',
      requestContext: { enabled: true, propagatedHeaders: { enabled: true, headers: ['foo'] } }
    };

    afterEach(function () {
      mock.restoreAll();
    });

    describe('request context is disabled', function () {
      it('does nothing', function () {
        const config = cloneDeep(Config);
        config.requestContext.enabled = false;
        const properties = {};
        appendHeadersFromStore(properties, new Map([['propagatedHeaders', { foo: 'bar' }]]), config);
        assert.deepStrictEqual(properties, {});
      });
    });

    describe('propagate headers is disabled', function () {
      it('does nothing', function () {
        const config = cloneDeep(Config);
        config.requestContext.propagatedHeaders.enabled = false;
        const properties = {};
        appendHeadersFromStore(properties, new Map([['propagatedHeaders', { foo: 'bar' }]]), config);
        assert.deepStrictEqual(properties, {});
      });
    });

    describe('propagate headers is enabled', function () {
      it('propagates headers from store to properties', function () {
        const properties = {};
        appendHeadersFromStore(properties, new Map([['propagatedHeaders', { foo: 'bar' }]]), Config);
        assert.deepStrictEqual(properties, { headers: { foo: 'bar', 'x-depth': '1' } });
      });

      it('propagates headers from store to properties chaning trace id', function () {
        mock.method(crypto, 'randomUUID', () => 'new-uuid' as any);
        const properties = {};
        const store = new Map([['propagatedHeaders', { foo: 'bar', 'x-depth': '1' }]]);
        appendHeadersFromStore(properties, store, Config);
        assert.deepStrictEqual(properties, { headers: { foo: 'orka:new-uuid', 'x-parent-id': 'bar', 'x-depth': '2' } });
        assert.deepStrictEqual(Object.fromEntries(store), { propagatedHeaders: { foo: 'bar', 'x-depth': '1' } });
      });

      it('propagates headers from store to properties adding initiator id too', function () {
        mock.method(crypto, 'randomUUID', () => 'new-uuid' as any);
        const properties = { headers: { 'x-parent-id': 'irrelevant' } };

        const store = new Map([['propagatedHeaders', { foo: 'parent-id', 'x-depth': '3', 'x-parent-id': 'bar' }]]);

        appendHeadersFromStore(properties, store, Config);
        assert.deepStrictEqual(properties, {
          headers: { foo: 'orka:new-uuid', 'x-parent-id': 'parent-id', 'x-depth': '4', 'x-initiator-id': 'bar' }
        });
        assert.deepStrictEqual(Object.fromEntries(store), {
          propagatedHeaders: { foo: 'parent-id', 'x-depth': '3', 'x-parent-id': 'bar' }
        });
      });
    });
  });

  describe('appendToStore', function () {
    const Config = {
      traceHeaderName: 'foo',
      requestContext: { enabled: true, propagatedHeaders: { enabled: true, headers: ['foo'] } }
    };
    const properties = { headers: { foo: 'bar' } };

    afterEach(function () {
      mock.restoreAll();
    });

    describe('request context is disabled', function () {
      it('does nothing', function () {
        const config = cloneDeep(Config);
        config.requestContext.enabled = false;
        const store = new Map();
        appendToStore(store, properties, config);
        assert.deepStrictEqual(Object.fromEntries(store), {});
      });
    });

    describe('propagate headers is disabled', function () {
      it('does nothing', function () {
        const config = cloneDeep(Config);
        config.requestContext.propagatedHeaders.enabled = false;
        const store = new Map();
        appendToStore(store, properties, config);
        assert.deepStrictEqual(Object.fromEntries(store), {});
      });
    });

    describe('propagate headers is enabled', function () {
      it('propagates headers from store to properties', function () {
        const store = new Map();
        appendToStore(store, properties, Config);
        assert.deepStrictEqual(Object.fromEntries(store), { propagatedHeaders: { foo: 'bar' } });
      });
    });
  });
});
