import * as sinon from 'sinon';
import 'should';
import certificates from '../../../src/initializers/kafka/auth-options';
import * as tmp from 'tmp';
import * as fs from 'fs';

const sandbox = sinon.sandbox.create();

let fsSpy;
let tmpSpy;

describe('kafka auth options', () => {
  beforeEach(() => {
    fsSpy = sandbox.spy();
    tmpSpy = sandbox.spy();
    fsSpy = sandbox.stub(fs, 'writeFileSync');
    tmpSpy = sandbox.stub(tmp, 'fileSync');

    tmpSpy.onCall(0).returns({ name: 'tmpkey' });
    tmpSpy.onCall(1).returns({ name: 'tmpcert' });
    tmpSpy.onCall(2).returns({ name: 'tmpca' });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call methods fileSync and writeFileSync', () => {
    const result = certificates({ key: 'key', cert: 'cert', ca: 'ca' });
    tmpSpy.should.have.callCount(3);
    fsSpy.should.have.callCount(3);
    fsSpy.onCall(0).callsArgWith(0, 'tmpkey', 'key');
    fsSpy.onCall(1).callsArgWith(0, 'tmpcert', 'cert');
    fsSpy.onCall(2).callsArgWith(0, 'tmpca', 'ca');
    result.should.eql({
      'security.protocol': 'ssl',
      'ssl.key.location': 'tmpkey',
      'ssl.certificate.location': 'cert',
      'ssl.ca.location': 'ca'
    });
  });
});
