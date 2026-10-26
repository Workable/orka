import * as sinon from 'sinon';
import { Context } from 'koa';
import 'should';
import rejectBrotliEncoding from '../../src/middlewares/reject-brotli-encoding';

describe('rejectBrotliEncoding middleware', function () {
  const sandbox = sinon.createSandbox();
  const contentEncodingHeader = 'content-encoding';

  afterEach(function () {
    sandbox.restore();
  });

  const invoke = async (contentEncoding?: string | string[]) => {
    const headers: { [name: string]: string | string[] | undefined } = {};
    if (contentEncoding !== undefined) {
      headers[contentEncodingHeader] = contentEncoding;
    }
    const ctx = { request: { headers } } as Context;
    const next = sandbox.stub().resolves();
    await rejectBrotliEncoding(ctx, next);
    return { ctx, next };
  };

  it('rejects br with 415 without calling next', async function () {
    const { ctx, next } = await invoke('br');
    ctx.status.should.eql(415);
    next.called.should.be.false();
  });

  it('rejects BR with 415 without calling next', async function () {
    const { ctx, next } = await invoke('BR');
    ctx.status.should.eql(415);
    next.called.should.be.false();
  });

  it('rejects gzip, br with 415 without calling next', async function () {
    const { ctx, next } = await invoke('gzip, br');
    ctx.status.should.eql(415);
    next.called.should.be.false();
  });

  it('rejects a header array that includes br with 415 without calling next', async function () {
    const { ctx, next } = await invoke(['gzip', 'br']);
    ctx.status.should.eql(415);
    next.called.should.be.false();
  });

  it('calls next when Content-Encoding is missing', async function () {
    const { next } = await invoke();
    next.called.should.be.true();
  });

  it('calls next for gzip', async function () {
    const { next } = await invoke('gzip');
    next.called.should.be.true();
  });
});
