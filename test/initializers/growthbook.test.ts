import growthbook, {getGrowthbook} from '../../src/initializers/growthbook';
import {GrowthBook} from 'growthbook';

describe('Test growthbook', function () {
  const config = {growthbook: {apiKey: '12345'}};

  it('should not create growthbook instance if config is missing growthbook key', () => {
    const gb = growthbook({});
    should(gb).be.undefined();
  });

  it('should create growthbook instance', () => {
    const gb = growthbook(config);
    gb.should.be.instanceof(GrowthBook);
    const gb1 = getGrowthbook();
    gb1.should.equal(gb);
  });
});
