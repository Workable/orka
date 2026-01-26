import { describe, it, after, mock } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import * as log4js from 'log4js';
import { omit } from 'lodash';
import { isBlacklisted, getExplicitLogLevel } from '../../../src/initializers/koa/error-handler';
import { getMockCallArgs } from '../../helpers/assert-helpers';

describe('error-handler', function () {
  let server: any;

  after(function () {
    if (server) server.stop();
  });

  it('tests custom error handler', async function () {
    const errorHandler = mock.fn((ctx: any, err: any, { omitErrorKeys }: any) => {
      ctx.body = err;
      return [err, { state: omit(ctx.state, omitErrorKeys) }];
    });
    delete require.cache[require.resolve('../../../examples/custom-error-handler-example/app')];
    delete require.cache[require.resolve('../../../examples/simple-example/config')];
    const init = require('../../../examples/custom-error-handler-example/app');

    server = await init(
      () => [
        async (ctx: any, next: any) => {
          ctx.state.foo = 'foo';
          ctx.state.bar = 'bar';
          await next();
        }
      ],
      errorHandler,
      ['bar', 'riviereStartedAt']
    );
    const loggerStub = mock.method(log4js.getLogger('orka.errorHandler').constructor.prototype, 'error', () => {});
    const { body } = await (supertest('localhost:3000') as any)
      .get('/error/test')
      .set('X-Orka-Request-Id', '1')
      .expect(500);
    assert.deepStrictEqual(body, {
      action: '/error/:type',
      component: 'koa',
      params: {
        path: { type: 'test' },
        body: {},
        query: {},
        requestId: '1'
      }
    });
    const error = Object.assign(new Error('new error'), {
      component: 'koa',
      action: '/error/:type',
      params: { path: { type: 'test' }, requestId: '1', body: {}, query: {} }
    });
    assert.deepStrictEqual(getMockCallArgs(errorHandler)[0][1], error);
    assert.deepStrictEqual(getMockCallArgs(loggerStub), [[error, { state: { requestId: '1', foo: 'foo' } }]]);
  });

  it('tests error code blacklisting', () => {
    const config = { blacklistedErrorCodes: ['400', 500] };
    assert.strictEqual(isBlacklisted({ status: 400 }, config), true);
    assert.strictEqual(isBlacklisted({ status: '400' } as any, config), true);
    assert.strictEqual(isBlacklisted({ status: 500 }, config), true);
    assert.strictEqual(isBlacklisted({ status: '500' } as any, config), true);
    assert.strictEqual(isBlacklisted({ status: 200 } as any, config), false);
    assert.strictEqual(isBlacklisted({ status: '200' } as any, config), false);
    assert.strictEqual(isBlacklisted({ status: 404 }, config), false);
    assert.strictEqual(isBlacklisted({ status: 404, blacklist: true }, config), true);
  });

  it('tests getExplicitLogLevel from error logLevel', () => {
    assert.strictEqual(getExplicitLogLevel(null as any), null);
    assert.strictEqual(getExplicitLogLevel(undefined as any), null);
    assert.strictEqual(getExplicitLogLevel({}), null);
    assert.strictEqual(getExplicitLogLevel({ logLevel: null } as any), null);
    assert.strictEqual(getExplicitLogLevel({ logLevel: undefined } as any), null);
    assert.strictEqual(getExplicitLogLevel({ logLevel: 'level' } as any), null);
    assert.strictEqual(getExplicitLogLevel({ logLevel: 'non_existing_level' } as any), null);

    assert.strictEqual(getExplicitLogLevel({ logLevel: 'FATAL' } as any), 'fatal');
    assert.strictEqual(getExplicitLogLevel({ logLevel: 'ERROR' } as any), 'error');
    assert.strictEqual(getExplicitLogLevel({ logLevel: 'error' } as any), 'error');
    assert.strictEqual(getExplicitLogLevel({ logLevel: 'warn' } as any), 'warn');
    assert.strictEqual(getExplicitLogLevel({ logLevel: 'WARN' } as any), 'warn');
    assert.strictEqual(getExplicitLogLevel({ logLevel: 'INFO' } as any), 'info');
    assert.strictEqual(getExplicitLogLevel({ logLevel: 'DEBUG' } as any), 'debug');
  });
});
