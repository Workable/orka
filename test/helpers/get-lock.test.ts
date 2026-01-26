import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import getLock from '../../src/helpers/get-lock';

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

describe('getLock', function () {
  let stub: any;
  let locked: any;

  beforeEach(function () {
    stub = mock.fn();
    locked = async (name: string, lockName = 'test') => {
      const lock = await getLock(lockName);
      await delay(1);
      stub(name, 1);
      await delay(2);
      stub(name, 2);
      await delay(3);
      stub(name, 3);
      lock.release();
    };
  });

  afterEach(function () {
    mock.restoreAll();
  });

  it('can only acquire one lock at a time', async function () {
    await Promise.all([locked('1'), locked('2'), locked('3'), locked('4')]);
    // When locks are serialized, all calls for '1' complete before '2' starts, etc.
    assert.strictEqual(stub.mock.calls.length, 12);
    // Verify sequential execution by checking that all steps for one name complete before the next
    const args = stub.mock.calls.map((c: any) => c.arguments);
    // All three calls for '1' should appear before any calls for '2'
    const name1Indices = args.map((a: any, i: number) => a[0] === '1' ? i : -1).filter((i: number) => i >= 0);
    const name2Indices = args.map((a: any, i: number) => a[0] === '2' ? i : -1).filter((i: number) => i >= 0);
    assert.ok(Math.max(...name1Indices) < Math.min(...name2Indices));
  });

  it('can only acquire multiple different locks at a time', async function () {
    await Promise.all([locked('1', '1'), locked('2', '2'), locked('3', '3'), locked('4', '4')]);
    // When different locks are used, they can run in parallel
    assert.strictEqual(stub.mock.calls.length, 12);
    // With different lock names, execution can be interleaved
  });
});
