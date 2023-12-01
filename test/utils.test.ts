import { appendHeadersFromStore, appendToStore, nodeVersionGreaterThanEqual } from '../src/utils';
import { cloneDeep } from 'lodash';
import * as sinon from 'sinon';
import * as crypto from 'crypto';

const sandbox = sinon.createSandbox();

describe('utils', function () {
  describe('nodeVersionGreaterThanEqual', function () {
    const version = 'v10.11.5';

    it('major greater than', function () {
      nodeVersionGreaterThanEqual('v9.12.0', version).should.eql(true);
    });
    it('major less than', function () {
      nodeVersionGreaterThanEqual('v11.1.0', version).should.eql(false);
    });
    it('minor greater than', function () {
      nodeVersionGreaterThanEqual('v10.5.0', version).should.eql(true);
    });
    it('minor less than', function () {
      nodeVersionGreaterThanEqual('v10.12.0', version).should.eql(false);
    });
    it('patch greater than', function () {
      nodeVersionGreaterThanEqual('v10.11.1', version).should.eql(true);
    });
    it('patch less than', function () {
      nodeVersionGreaterThanEqual('v10.11.7', version).should.eql(false);
    });
    it('equal version', function () {
      nodeVersionGreaterThanEqual('v10.11.5', version).should.eql(true);
    });
  });

  describe('appendHeadersFromStore', function () {
    const Config = {
      traceHeaderName: 'foo',
      requestContext: { enabled: true, propagatedHeaders: { enabled: true, headers: ['foo'] } }
    };

    afterEach(function () {
      sandbox.restore();
    });

    context('request context is disabled', function () {
      it('does nothing', function () {
        const config = cloneDeep(Config);
        config.requestContext.enabled = false;
        const properties = {};
        appendHeadersFromStore(properties, new Map([['propagatedHeaders', { foo: 'bar' }]]), config);
        properties.should.eql({});
      });
    });

    context('propagate headers is disabled', function () {
      it('does nothing', function () {
        const config = cloneDeep(Config);
        config.requestContext.propagatedHeaders.enabled = false;
        const properties = {};
        appendHeadersFromStore(properties, new Map([['propagatedHeaders', { foo: 'bar' }]]), config);
        properties.should.eql({});
      });
    });

    context('propagate headers is enabled', function () {
      it('propagates headers from store to properties', function () {
        const properties = {};
        appendHeadersFromStore(properties, new Map([['propagatedHeaders', { foo: 'bar' }]]), Config);
        properties.should.eql({ headers: { foo: 'bar', 'x-depth': '1' } });
      });

      it('propagates headers from store to properties chaning trace id', function () {
        sandbox.stub(crypto, 'randomUUID').returns('new-uuid' as any);
        const properties = {};
        const store = new Map([['propagatedHeaders', { foo: 'bar', 'x-depth': '1' }]]);
        appendHeadersFromStore(properties, store, Config);
        properties.should.eql({ headers: { foo: 'orka:new-uuid', 'x-parent-id': 'bar', 'x-depth': '2' } });
        Object.fromEntries(store).should.eql({ propagatedHeaders: { foo: 'bar', 'x-depth': '1' } });
      });

      it('propagates headers from store to properties adding initiator id too', function () {
        sandbox.stub(crypto, 'randomUUID').returns('new-uuid' as any);
        const properties = { headers: { 'x-parent-id': 'irrelevant' } };

        const store = new Map([['propagatedHeaders', { foo: 'parent-id', 'x-depth': '3', 'x-parent-id': 'bar' }]]);

        appendHeadersFromStore(properties, store, Config);
        properties.should.eql({
          headers: { foo: 'orka:new-uuid', 'x-parent-id': 'parent-id', 'x-depth': '4', 'x-initiator-id': 'bar' }
        });
        Object.fromEntries(store).should.eql({
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
      sandbox.restore();
    });

    context('request context is disabled', function () {
      it('does nothing', function () {
        const config = cloneDeep(Config);
        config.requestContext.enabled = false;
        const store = new Map();
        appendToStore(store, properties, config);
        Object.fromEntries(store).should.eql({});
      });
    });

    context('propagate headers is disabled', function () {
      it('does nothing', function () {
        const config = cloneDeep(Config);
        config.requestContext.propagatedHeaders.enabled = false;
        const store = new Map();
        appendToStore(store, properties, config);
        Object.fromEntries(store).should.eql({});
      });
    });

    context('propagate headers is enabled', function () {
      it('propagates headers from store to properties', function () {
        const store = new Map();
        appendToStore(store, properties, Config);
        Object.fromEntries(store).should.eql({ propagatedHeaders: { foo: 'bar' } });
      });
    });
  });
});
