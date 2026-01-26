import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { Context } from 'koa';
import OrkaBuilder from '../../src/orka-builder';

describe('Growthbook middleware', function () {
  let next: any;
  let growthbookMockInstance: any;
  let loadFeaturesStub: ReturnType<typeof mock.fn>;
  let setAttributesStub: ReturnType<typeof mock.fn>;
  let destroyStub: ReturnType<typeof mock.fn>;
  let growthbook: any;

  beforeEach(async function () {
    next = mock.fn();
    loadFeaturesStub = mock.fn(async () => { /* noop */ });
    destroyStub = mock.fn();
    setAttributesStub = mock.fn();
    growthbookMockInstance = {
      loadFeatures: loadFeaturesStub,
      destroy: destroyStub,
      setAttributes: setAttributesStub,
      getAttributes: () => ({})
    };

    mock.module('../../src/initializers/growthbook', {
      namedExports: {
        createGrowthbook: () => growthbookMockInstance
      }
    });

    OrkaBuilder.INSTANCE = {
      options: {
        growthbookAttributes: () => ({ attributeA: 'foo' })
      },
      config: {
        growthbook: {
          clientKey: 'sdk-123'
        }
      }
    } as any;

    delete require.cache[require.resolve('../../src/middlewares/growthbook')];
    growthbook = (await import('../../src/middlewares/growthbook')).default;
  });

  afterEach(function () {
    mock.restoreAll();
  });

  it('calls next when growthbook is missing from config', async function () {
    const ctx = { state: {} } as Context;
    OrkaBuilder.INSTANCE = { config: {} } as any;

    await growthbook(ctx, next);

    assert.strictEqual(ctx.state.growthbook, undefined);
    assert.strictEqual(next.mock.calls.length, 1);
  });

  it('calls next if is health path', async function () {
    const ctx = { path: '/health', state: {} } as Context;

    await growthbook(ctx, next);

    assert.strictEqual(ctx.state.growthbook, undefined);
    assert.strictEqual(next.mock.calls.length, 1);
  });

  it('loadsFeatures, setsAttributes and calls next', async function () {
    const ctx = { state: {} } as Context;
    await growthbook(ctx, next);
    assert.strictEqual(ctx.state.growthbook, growthbookMockInstance);
    assert.strictEqual(next.mock.calls.length, 1);
    assert.strictEqual(loadFeaturesStub.mock.calls.length, 1);
    assert.strictEqual(destroyStub.mock.calls.length, 1);
    assert.strictEqual(setAttributesStub.mock.calls.length, 1);
  });
});
