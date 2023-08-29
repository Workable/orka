import * as sinon from 'sinon';
import {Context} from 'koa';
import should = require('should');
import growthbook from '../../src/middlewares/growthbook';
import * as growthbookInitializer from '../../src/initializers/growthbook';
const mock = require('mock-require');

const sandbox = sinon.createSandbox();

describe('Growthbook middleware', function () {
  let next: sinon.SinonStub;
  let growthbookMockInstance;
  let loadFeaturesStub: sinon.SinonStub;
  let growthbookSpy: sinon.SinonStub;

  before(function () {
    growthbookSpy = sandbox.stub(growthbookInitializer, 'getGrowthbook');
  });

  beforeEach(async function () {
    next = sandbox.stub();
    loadFeaturesStub = sandbox.stub().resolves();
    growthbookMockInstance = {
      loadFeatures: loadFeaturesStub
    };
    growthbookSpy.returns(growthbookMockInstance);
  });

  it('calls next when growthbook is not configured', async function () {
    const ctx = {state: {}} as Context;
    growthbookSpy.returns(undefined);

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

  it('loadsFeatures and calls next', async function () {
    const ctx = {state: {}} as Context;
    await growthbook(ctx, next);
    ctx.state.growthbook.should.equal(growthbookMockInstance);
    next.called.should.be.true();
    loadFeaturesStub.called.should.be.true();
  });
});
