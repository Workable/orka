import assert from 'node:assert';

/**
 * Checks if the actual value contains all the properties from expected (deep partial match).
 * This is equivalent to should.js's containDeep() assertion.
 */
export function assertContainsDeep(actual: unknown, expected: unknown, path = ''): void {
  if (expected === null || expected === undefined) {
    assert.strictEqual(actual, expected, `${path}: expected ${expected}`);
    return;
  }

  if (typeof expected !== 'object') {
    assert.strictEqual(actual, expected, `${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    return;
  }

  if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual), `${path}: expected array, got ${typeof actual}`);
    for (let i = 0; i < expected.length; i++) {
      assert.ok(i < (actual as unknown[]).length, `${path}[${i}]: array index out of bounds`);
      assertContainsDeep((actual as unknown[])[i], expected[i], `${path}[${i}]`);
    }
    return;
  }

  assert.ok(
    typeof actual === 'object' && actual !== null,
    `${path}: expected object, got ${actual === null ? 'null' : typeof actual}`
  );

  for (const key of Object.keys(expected)) {
    const actualObj = actual as Record<string, unknown>;
    const expectedObj = expected as Record<string, unknown>;
    assert.ok(
      key in actualObj,
      `${path ? path + '.' : ''}${key}: property missing in actual object`
    );
    assertContainsDeep(actualObj[key], expectedObj[key], `${path ? path + '.' : ''}${key}`);
  }
}

/**
 * Asserts that calling fn throws an error.
 * Optionally checks that the error matches the expected message or type.
 */
export function assertThrows(
  fn: () => unknown,
  expected?: string | RegExp | Error | (new (...args: unknown[]) => Error)
): void {
  let threw = false;
  let error: unknown;

  try {
    fn();
  } catch (e) {
    threw = true;
    error = e;
  }

  assert.ok(threw, 'Expected function to throw an error');

  if (expected !== undefined) {
    if (typeof expected === 'string') {
      assert.ok(
        error instanceof Error && error.message.includes(expected),
        `Expected error message to include "${expected}", got "${error instanceof Error ? error.message : error}"`
      );
    } else if (expected instanceof RegExp) {
      assert.ok(
        error instanceof Error && expected.test(error.message),
        `Expected error message to match ${expected}, got "${error instanceof Error ? error.message : error}"`
      );
    } else if (typeof expected === 'function') {
      assert.ok(
        error instanceof expected,
        `Expected error to be instance of ${expected.name}`
      );
    }
  }
}

/**
 * Helper to get mock call arguments in a format similar to sinon's stub.args
 */
export function getMockCallArgs<T extends unknown[]>(
  mockFn: { mock: { calls: Array<{ arguments: T }> } }
): T[] {
  return mockFn.mock.calls.map(c => c.arguments);
}

/**
 * Helper to check if a mock was called with specific arguments
 */
export function mockCalledWith<T extends unknown[]>(
  mockFn: { mock: { calls: Array<{ arguments: T }> } },
  ...expectedArgs: unknown[]
): boolean {
  return mockFn.mock.calls.some(call => {
    if (call.arguments.length !== expectedArgs.length) return false;
    return expectedArgs.every((arg, i) => {
      try {
        assert.deepStrictEqual(call.arguments[i], arg);
        return true;
      } catch {
        return false;
      }
    });
  });
}
