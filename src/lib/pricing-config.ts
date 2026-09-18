import { registryStats } from '@/__registry__/stats'

export const PRO_YEARLY_PRICE = 99
export const PRO_YEARLY_NEXT_PRICE = 129
export const LIFETIME_PRICE = 179
export const AVERAGE_ITEM_PRICE = 45

// Manually updated as subscribers join — controls the "price increase" progress bar on /pricing.
// PRO_YEARLY_MILESTONE_TARGET is the subscriber count at which the price moves to PRO_YEARLY_NEXT_PRICE.
export const PRO_YEARLY_MILESTONE_CURRENT = 63
export const PRO_YEARLY_MILESTONE_TARGET = 100

export const REGISTRY_STATS = {
  primitives: registryStats.primitives,
  primitivesFree: registryStats.primitivesFree,
  primitivesPro: registryStats.primitivesPro,
  components: registryStats.components,
  componentsFree: registryStats.componentsFree,
  componentsPro: registryStats.componentsPro,
  proComponents: registryStats.components,
  blockCollections: registryStats.blocks,
  blocksFree: registryStats.blocksFree,
  blocksPro: registryStats.blocksPro,
  examples: registryStats.demos,
  templatesFree: registryStats.templatesFree,
  templatesPro: registryStats.templatesPro,
  templatesTotal: registryStats.templatesTotal,
  hooks: registryStats.hooks,
  hooksFree: registryStats.hooksFree,
  hooksPro: registryStats.hooksPro,
  totalPro: registryStats.totalPro,
  totalFree: registryStats.totalFree,
  totalComponents: registryStats.primitives + registryStats.components,
}
