import { nodeVersionGreaterThanEqual } from '../src/utis';

describe('utils', function() {
  describe('nodeVersionGreaterThanEqual', function() {
    const version = 'v10.11.5';

    it('major greater than', function() {
      nodeVersionGreaterThanEqual('v9.12.0', version).should.eql(true);
    });
    it('major less than', function() {
      nodeVersionGreaterThanEqual('v11.1.0', version).should.eql(false);
    });
    it('minor greater than', function() {
      nodeVersionGreaterThanEqual('v10.5.0', version).should.eql(true);
    });
    it('minor less than', function() {
      nodeVersionGreaterThanEqual('v10.12.0', version).should.eql(false);
    });
    it('patch greater than', function() {
      nodeVersionGreaterThanEqual('v10.11.1', version).should.eql(true);
    });
    it('patch less than', function() {
      nodeVersionGreaterThanEqual('v10.11.7', version).should.eql(false);
    });
    it('equal version', function() {
      nodeVersionGreaterThanEqual('v10.11.5', version).should.eql(true);
    });
  });
});
