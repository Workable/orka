import 'should';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
const init = require('../../../examples/custom-error-handler-example/app');
import * as log4js from 'log4js';

const sandbox = sinon.createSandbox();

describe('error-handler', function() {
  let server;

  after(function() {
    if (server) server.stop();
  });

  it('tests custom error handler', async function() {
    const errorHandler = sandbox.stub().callsFake((ctx, err) => (ctx.body = err));
    server = await init(
      () => [
        ctx => {
          ctx.state.foo = 'foo';
          ctx.state.bar = 'bar';
          throw new Error('test');
        }
      ],
      errorHandler,
      ['bar']
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
    loggerStub.args.should.eql([
      [
        error,
        {
          // tslint:disable-next-line: quotemark
          state: "{ requestId: '1', foo: 'foo' }"
        }
      ]
    ]);
  });
});
