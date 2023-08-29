import requireInjected from '../require-injected';
import type * as GrowthbookType from 'growthbook';

/**
 * Creates a new GrowthBook instance. You need to call `.destroy()` after you finished, to avoid memory leaks
 *
 * @param config The configuration passed to GrowthBook's constructor
 */
export const createGrowthbook = <AppFeatures extends Record<string, any> = Record<string, any>>(config: GrowthbookType.Context) => {
  if (!config?.clientKey) return;
  const {GrowthBook} = requireInjected('growthbook');
  return new GrowthBook(config) as GrowthbookType.GrowthBook<AppFeatures>;
};
