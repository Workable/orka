import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import middleware from '../../../src/initializers/koa/parse-querystring';

describe('parse-querystring', function () {
  let ctx: any;

  beforeEach(function () {
    ctx = {
      querystring: 'firstname=john&lastname=doe&children[]=bolek&children[]=lolek',
      state: {},
    } as any;
  });

  it('parses querystring and calls next', async function () {
    const next = mock.fn();

    await middleware(ctx, next);

    assert.strictEqual(next.mock.callCount(), 1);
    assert.deepStrictEqual(ctx.state.query, {
      firstname: 'john',
      lastname: 'doe',
      children: ['bolek', 'lolek']
    });
  });

  it('overrides query in state', async function () {
    const next = mock.fn();

    await middleware(ctx, next);

    assert.strictEqual(next.mock.callCount(), 1);
    ctx.state.query = 'asd';
    assert.strictEqual(ctx.state.query, 'asd');
  });
});
