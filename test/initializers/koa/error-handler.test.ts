import * as should from 'should';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import * as log4js from 'log4js';
import { omit } from 'lodash';
import { isBlacklisted, getExplicitLogLevel } from '../../../src/initializers/koa/error-handler';

const sandbox = sinon.createSandbox();

describe('error-handler', function () {
  let server;

  after(function () {
    if (server) server.stop();
  });

  it('tests custom error handler', async function () {
    const errorHandler = sandbox.stub().callsFake((ctx, err, { omitErrorKeys }) => {
      ctx.body = err;
      return [err, { state: omit(ctx.state, omitErrorKeys) }];
    });
    delete require.cache[require.resolve('../../../examples/custom-error-handler-example/app')];
    delete require.cache[require.resolve('../../../examples/simple-example/config')];
    const init = require('../../../examples/custom-error-handler-example/app');

    server = await init(
      () => [
        async (ctx, next) => {
          ctx.state.foo = 'foo';
          ctx.state.bar = 'bar';
          await next();
        }
      ],
      errorHandler,
      ['bar', 'riviereStartedAt']
    );
    const loggerStub = sandbox.stub(log4js.getLogger('orka.errorHandler').constructor.prototype, 'error');
    const { body } = await (supertest('localhost:3000') as any)
      .get('/error/test')
      .set('X-Orka-Request-Id', '1')
      .expect(500);
    body.should.eql({
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
    errorHandler.args[0][1].should.eql(error);
    loggerStub.args.should.eql([[error, { state: { requestId: '1', foo: 'foo' } }]]);
  });

  it('tests error code blacklisting', () => {
    const config = { blacklistedErrorCodes: ['400', 500] };
    isBlacklisted({ status: 400 }, config).should.equal(true);
    isBlacklisted({ status: '400' } as any, config).should.equal(true);
    isBlacklisted({ status: 500 }, config).should.equal(true);
    isBlacklisted({ status: '500' } as any, config).should.equal(true);
    isBlacklisted({ status: 200 } as any, config).should.equal(false);
    isBlacklisted({ status: '200' } as any, config).should.equal(false);
    isBlacklisted({ status: 404 }, config).should.equal(false);
    isBlacklisted({ status: 404, blacklist: true }, config).should.equal(true);
  });

  it('tests getExplicitLogLevel from error logLevel', () => {
    should.equal(null, getExplicitLogLevel(null));
    should.equal(null, getExplicitLogLevel(undefined));
    should.equal(null, getExplicitLogLevel({}));
    should.equal(null, getExplicitLogLevel({ logLevel: null }));
    should.equal(null, getExplicitLogLevel({ logLevel: undefined }));
    should.equal(null, getExplicitLogLevel({ logLevel: 'level' }));
    should.equal(null, getExplicitLogLevel({ logLevel: 'non_existing_level' }));

    getExplicitLogLevel({ logLevel: 'FATAL' }).should.equal('fatal');
    getExplicitLogLevel({ logLevel: 'ERROR' }).should.equal('error');
    getExplicitLogLevel({ logLevel: 'error' }).should.equal('error');
    getExplicitLogLevel({ logLevel: 'warn' }).should.equal('warn');
    getExplicitLogLevel({ logLevel: 'WARN' }).should.equal('warn');
    getExplicitLogLevel({ logLevel: 'INFO' }).should.equal('info');
    getExplicitLogLevel({ logLevel: 'DEBUG' }).should.equal('debug');
  });
});
