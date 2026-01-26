import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createGrowthbook } from '../../src/initializers/growthbook';
import { GrowthBook } from 'growthbook';

describe('Test growthbook', function () {
  const config = { growthbook: { clientKey: '12345' } };

  it('should create growthbook instance', () => {
    const gb = createGrowthbook(config.growthbook);
    assert.ok(gb instanceof GrowthBook);
  });
});
