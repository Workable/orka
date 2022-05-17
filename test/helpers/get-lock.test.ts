import getLock from '../../src/helpers/get-lock';
import * as sinon from 'sinon';
import * as snapshot from 'snap-shot-it';

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
const sandbox = sinon.createSandbox();

describe('getLock', function () {
  beforeEach(function () {
    this.stub = sandbox.stub();
    this.locked = async (name, lockName = 'test') => {
      const lock = await getLock(lockName);
      await delay(1);
      this.stub(name, 1);
      await delay(2);
      this.stub(name, 2);
      await delay(3);
      this.stub(name, 3);
      lock.release();
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('can only acquire one lock at a time', async function () {
    await Promise.all([this.locked('1'), this.locked('2'), this.locked('3'), this.locked('4')]);
    snapshot(this.stub.args);
  });

  it('can only acquire multiple different locks at a time', async function () {
    await Promise.all([this.locked('1', '1'), this.locked('2', '2'), this.locked('3', '3'), this.locked('4', '4')]);
    snapshot(this.stub.args);
  });
});
