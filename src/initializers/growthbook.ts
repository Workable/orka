import requireInjected from '../require-injected';
import type * as GrowthbookType from 'growthbook';

let gb: GrowthbookType.GrowthBook;

const createGrowthbook = <AppFeatures extends Record<string, any> = Record<string, any>>(config) => {
  if (!config.growthbook) return;
  if (!gb) {
    const {GrowthBook} = requireInjected('growthbook');
    gb = new GrowthBook<AppFeatures>({
      apiHost: 'https://cdn.growthbook.io',
      clientKey: config.growthbook.clientKey
    });
  }
  return gb;
};

export default createGrowthbook;

export const getGrowthbook = <AppFeatures extends Record<string, any> = Record<string, any>>() => {
  if (!gb) {
    throw new Error('growthbook is not initialized');
  }
  return gb as GrowthbookType.GrowthBook<AppFeatures>;
};
