import 'should';
import init, { shutdownKafka } from '../../../src/initializers/kafka/index';

describe('kafka init', () => {
  it('should handle the absence of kafka config', async () => {
    await init({} as any);
  });

  it('shutdownKafka is a no-op when kafka is not initialized', async () => {
    const result = await shutdownKafka();
    (result === undefined).should.eql(true);
  });
});
