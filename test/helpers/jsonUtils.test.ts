import * as sinon from 'sinon';
import 'should';
import safeStringify from '../../src/helpers/jsonUtils';

const sandbox = sinon.createSandbox();

describe('Test jsonUtils safeStringify', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('should call JSON.stringify and return json as string', () => {
    const stringifySpy = sandbox.spy(JSON, 'stringify');

    const event = { id: 'id', message: 'message' };

    const result = safeStringify(event);
    result.should.eql('{"id":"id","message":"message"}');
    stringifySpy.calledOnce.should.be.true();
  });

  it('should catch error and stringify removing circular references', () => {
    const stringifySpy = sandbox.spy(JSON, 'stringify');

    const event = { id: 'id', message: 'message', context: {} };
    event.context = event;

    const result = safeStringify(event);
    result.should.eql('{"id":"id","message":"message","context":"circular_ref"}');
    stringifySpy.calledOnce.should.be.false();
    stringifySpy.calledTwice.should.be.true();
    stringifySpy.args[0].length.should.eql(1);
    stringifySpy.args[1].length.should.eql(2);
  });
});
