import * as sinon from 'sinon';
import {Context} from 'koa';
import * as should from 'should';
import growthbook from '../../src/middlewares/growthbook';
import * as growthbookInitializer from '../../src/initializers/growthbook';
import OrkaBuilder from '../../src/orka-builder';
const mock = require('mock-require');

const sandbox = sinon.createSandbox();

describe('Growthbook middleware', function () {
  let next: sinon.SinonStub;
  let growthbookMockInstance;
  let loadFeaturesStub: sinon.SinonStub;
  let setAttributesStub: sinon.SinonStub;
  let destroyStub: sinon.SinonStub;
  let growthbookSpy: sinon.SinonStub;

  before(function () {
    growthbookSpy = sandbox.stub(growthbookInitializer, 'createGrowthbook');
  });

  beforeEach(async function () {
    next = sandbox.stub();
    loadFeaturesStub = sandbox.stub().resolves();
    destroyStub = sandbox.stub();
    setAttributesStub = sandbox.stub();
    growthbookMockInstance = {
      loadFeatures: loadFeaturesStub,
      destroy: destroyStub,
      setAttributes: setAttributesStub,
      getAttributes: () => ({})
    };
    growthbookSpy.returns(growthbookMockInstance);
    OrkaBuilder.INSTANCE = {
      options: {
        growthbookAttributes: () => ({attributeA: 'foo'})
      },
      config: {
        growthbook: {
          clientKey: 'sdk-123'
        }
      }
    } as any;
  });

  it('calls next when growthbook is missing from config', async function () {
    const ctx = {state: {}} as Context;
    OrkaBuilder.INSTANCE = {config: {}} as any;

    await growthbook(ctx, next);

    should(ctx.state.growthbook).be.undefined();
    next.called.should.be.true();
  });

  it('calls next if is health path', async function () {
    const ctx = {path: '/health', state: {}} as Context;

    await growthbook(ctx, next);

    should(ctx.state.growthbook).be.undefined();
    next.called.should.be.true();
  });

  it('loadsFeatures, setsAttributes and calls next', async function () {
    const ctx = {state: {}} as Context;
    await growthbook(ctx, next);
    ctx.state.growthbook.should.equal(growthbookMockInstance);
    next.called.should.be.true();
    loadFeaturesStub.called.should.be.true();
    destroyStub.called.should.be.true();
    setAttributesStub.called.should.be.true();
  });
});
