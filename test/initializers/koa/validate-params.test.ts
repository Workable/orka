import 'should';
import * as sinon from 'sinon';
import * as Joi from 'joi';
import { validateBody, validateQueryString } from '../../../src/middlewares/validate-params';

const sandbox = sinon.createSandbox();

const schema = Joi.object().keys({
  keyString: Joi.string(),
  keyNumber: Joi.number(),
  keyBoolean: Joi.boolean(),
  keyStringArray: Joi.array().items(Joi.string())
});

describe('validate-params', function() {
  before(function() {
    sandbox.restore();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('tests validate body', async function() {
    const next = sandbox.stub();
    const ctx = {
      request: {
        body: {
          keyString: 'somestring',
          keyNumber: '2',
          keyBoolean: 'true',
          keyStringArray: ['a', 'b']
        }
      }
    } as any;

    await validateBody(schema)(ctx, next);

    next.calledOnce.should.be.equal(true);
    ctx.request.body.should.eql({
      keyString: 'somestring',
      keyNumber: 2,
      keyBoolean: true,
      keyStringArray: ['a', 'b']
    });
  });

  it('tests validate body with error', async function() {
    const next = sandbox.stub();
    const ctx = { request: { body: { keyNumber: 'somestring' } } } as any;
    await validateBody(schema)(ctx, next).should.be.rejectedWith(
      JSON.stringify({ keyNumber: '"keyNumber" must be a number' })
    );
    next.called.should.be.equal(false);
  });

  it('tests validate query string', async function() {
    const next = sandbox.stub();
    const ctx = {
      query: {
        keyString: 'somestring',
        keyNumber: '2',
        keyBoolean: 'true',
        keyStringArray: ['a', 'b']
      }
    } as any;

    await validateQueryString(schema)(ctx, next);
    next.calledOnce.should.be.equal(true);
  });

  it('tests validate query string with error', async function() {
    const next = sandbox.stub();
    const ctx = { query: { keyNumber: 'somestring' } } as any;
    await validateQueryString(schema)(ctx, next).should.be.rejectedWith(
      JSON.stringify({ keyNumber: '"keyNumber" must be a number' })
    );
    next.called.should.be.equal(false);
  });
});
