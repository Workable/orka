import 'should';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
const init = require('../../../examples/custom-error-handler-example/app');

const sandbox = sinon.createSandbox();

describe.only('error-handler', function() {
  let server;

  after(function() {
    if (server) server.stop();
  });

  it('tests custom error handler', async function() {
    const errorHandler = sandbox.stub().callsFake((ctx, err) => (ctx.body = err));
    server = await init(
      [
        () => {
          throw new Error('test');
        }
      ],
      errorHandler
    );
    const { body } = await (supertest('localhost:3000') as any)
      .get('/')
      .set('X-Request-Id', '1')
      .expect(500);
    body.should.eql({
      action: '/',
      component: 'koa',
      params: {
        body: {},
        requestId: '1'
      }
    });
    errorHandler.args[0][1].should.eql(
      Object.assign(new Error('test'), {
        component: 'koa',
        action: '/',
        params: { requestId: '1', body: {} }
      })
    );
  });
});
