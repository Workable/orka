import 'should';
import init from '../../../src/initializers/kafka/index';

describe('kafka init', () => {
  it('should handle the absence of kafka config', async () => {
    await init({} as any);
  });

  it('should not connect if brokers are empty', async () => {
    await init({ brokers: []} as any);
  });

  it('should not connect if brokers have empty string', async () => {
    await init({ brokers: ['']} as any);
  });
});
