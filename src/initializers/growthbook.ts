import requireInjected from '../require-injected';
import type * as GrowthbookType from 'growthbook';

let gb: GrowthbookType.GrowthBook;

export default config => {
  if (!gb) {
    const {GrowthBook} = requireInjected('growthbook');
    gb = new GrowthBook({
      apiHost: 'https://cdn.growthbook.io',
      clientKey: config.growthbook.clientKey
    });
  }
  return gb;
};

export const getGrowthbook = () => {
  if (!gb) {
    throw new Error('growthbook is not initialized');
  }
  return gb;
};
