import * as sinon from 'sinon';
import 'should';
import certificates from '../../../src/initializers/kafka/auth-options';
import * as tmp from 'tmp';
import * as fs from 'fs';

const sandbox = sinon.sandbox.create();

let fsStub;
let tmpStub;

describe('kafka auth options', () => {
  beforeEach(() => {
    fsStub = sandbox.stub(fs, 'writeFileSync');
    tmpStub = sandbox.stub(tmp, 'fileSync');

    tmpStub.onCall(0).returns({ name: 'tmpkey' });
    tmpStub.onCall(1).returns({ name: 'tmpcert' });
    tmpStub.onCall(2).returns({ name: 'tmpca' });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call methods fileSync and writeFileSync', () => {
    const result = certificates({ key: 'key', cert: 'cert', ca: 'ca' });
    tmpStub.calledThrice.should.eql(true);
    fsStub.calledThrice.should.eql(true);
    fsStub.onCall(0).callsArgWith(0, 'tmpkey', 'key');
    fsStub.onCall(1).callsArgWith(0, 'tmpcert', 'cert');
    fsStub.onCall(2).callsArgWith(0, 'tmpca', 'ca');
    result.should.eql({
      'security.protocol': 'ssl',
      'ssl.key.location': 'tmpkey',
      'ssl.certificate.location': 'tmpcert',
      'ssl.ca.location': 'tmpca'
    });
  });
});
