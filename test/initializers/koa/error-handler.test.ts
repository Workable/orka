import 'should';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import * as log4js from 'log4js';
import { omit } from 'lodash';
import { isBlacklisted } from '../../../src/initializers/koa/error-handler';

const sandbox = sinon.createSandbox();

describe('error-handler', function() {
  let server;

  after(function() {
    if (server) server.stop();
  });

  it('tests custom error handler', async function() {
    const errorHandler = sandbox.stub().callsFake((ctx, err, { omitErrorKeys }) => {
      ctx.body = err;
      return [err, { state: omit(ctx.state, omitErrorKeys) }];
    });
    delete require.cache[require.resolve('../../../examples/custom-error-handler-example/app')];
    delete require.cache[require.resolve('../../../examples/simple-example/config')];
    const init = require('../../../examples/custom-error-handler-example/app');

    server = await init(
      () => [
        ctx => {
          ctx.state.foo = 'foo';
          ctx.state.bar = 'bar';
          throw new Error('test');
        }
      ],
      errorHandler,
      ['bar', 'riviereStartedAt']
    );
    const loggerStub = sandbox.stub(log4js.getLogger('orka.errorHandler').constructor.prototype, 'error');
    const { body } = await (supertest('localhost:3000') as any)
      .get('/')
      .set('X-Request-Id', '1')
      .expect(500);
    body.should.eql({
      action: '/',
      component: 'koa',
      params: {
        body: {},
        query: {},
        requestId: '1'
      }
    });
    const error = Object.assign(new Error('test'), {
      component: 'koa',
      action: '/',
      params: { requestId: '1', body: {}, query: {} }
    });
    errorHandler.args[0][1].should.eql(error);
    loggerStub.args.should.eql([[error, { state: { requestId: '1', foo: 'foo', visitor: undefined } }]]);
  });

  it('tests error code blacklisting', () => {
    const config = { blacklistedErrorCodes: ['400', 500] };
    isBlacklisted({ status: 400 }, config).should.equal(true);
    isBlacklisted({ status: '400' } as any, config).should.equal(true);
    isBlacklisted({ status: 500 }, config).should.equal(true);
    isBlacklisted({ status: '500' } as any, config).should.equal(true);
    isBlacklisted({ status: 200 } as any, config).should.equal(false);
    isBlacklisted({ status: '200' } as any, config).should.equal(false);
  });
});
