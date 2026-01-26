import { describe, it, before, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import * as Joi from 'joi';
import { validateBody, validateQueryString } from '../../../src/middlewares/validate-params';

const schema = Joi.object().keys({
  keyString: Joi.string(),
  keyNumber: Joi.number(),
  keyBoolean: Joi.boolean(),
  keyStringArray: Joi.array().items(Joi.string())
});

describe('validate-params', function() {
  before(function() {
    mock.restoreAll();
  });

  afterEach(function() {
    mock.restoreAll();
  });

  it('tests validate body', async function() {
    const next = mock.fn();
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

    assert.strictEqual(next.mock.calls.length, 1);
    assert.deepStrictEqual(ctx.request.body, {
      keyString: 'somestring',
      keyNumber: 2,
      keyBoolean: true,
      keyStringArray: ['a', 'b']
    });
  });

  it('tests validate body with error', async function() {
    const next = mock.fn();
    const ctx = { request: { body: { keyNumber: 'somestring' } } } as any;
    await assert.rejects(
      async () => await validateBody(schema)(ctx, next),
      (err: any) => {
        assert.strictEqual(err.message, JSON.stringify({ keyNumber: '"keyNumber" must be a number' }));
        return true;
      }
    );
    assert.strictEqual(next.mock.calls.length, 0);
  });

  it('tests validate query string', async function() {
    const next = mock.fn();
    const ctx = {
      query: {
        keyString: 'somestring',
        keyNumber: '2',
        keyBoolean: 'true',
        keyStringArray: ['a', 'b']
      }
    } as any;

    await validateQueryString(schema)(ctx, next);
    assert.strictEqual(next.mock.calls.length, 1);
  });

  it('tests validate query string with error', async function() {
    const next = mock.fn();
    const ctx = { query: { keyNumber: 'somestring' } } as any;
    await assert.rejects(
      async () => await validateQueryString(schema)(ctx, next),
      (err: any) => {
        assert.strictEqual(err.message, JSON.stringify({ keyNumber: '"keyNumber" must be a number' }));
        return true;
      }
    );
    assert.strictEqual(next.mock.calls.length, 0);
  });
});
