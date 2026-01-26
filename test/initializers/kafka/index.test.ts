import { describe, it } from 'node:test';
import init from '../../../src/initializers/kafka/index';

describe('kafka init', () => {
  it('should handle the absence of kafka config', async () => {
    await init({} as any);
  });
});
