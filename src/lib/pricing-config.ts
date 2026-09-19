import { registryStats } from '@/__registry__/stats'

export const AVERAGE_ITEM_PRICE = 45

// Backend-only price schedule, keyed by total completed sales per product (Polar). Resolved against
// live sales counts from Supabase by `getPricingSnapshot` (src/lib/pricing-tiers.ts) — not read
// directly by any component. `minSales` is inclusive; the highest matching tier for the current sales
// count is the active price.
//
// Both Polar products are now permanently priced at the FINAL tier's amount (Pro Yearly $169,
// Lifetime $199). Every earlier tier is a Polar `Discount` (type "fixed", duration "once") scoped to
// its own product, applied automatically at checkout — see `discountId` below and
// `src/app/(marketing)/checkout/route.ts`. The final tier has no discount id (already the sticker
// price). If the schedule changes, the discounts must be recreated on Polar and their ids pasted here.
export type PricingTier = {
  minSales: number
  proYearlyPrice: number
  lifetimePrice: number
  proYearlyDiscountId?: string
  lifetimeDiscountId?: string
}
export const PRICING_TIERS: PricingTier[] = [
  {
    minSales: 0,
    proYearlyPrice: 99,
    lifetimePrice: 129,
    proYearlyDiscountId: 'fa9b7416-cae7-4f70-a20a-f1cdacec4739', // PROEARLY99
    lifetimeDiscountId: '72a27d88-2e6b-4d22-b123-3562fc3a22d6', // LIFETIME129
  },
  {
    minSales: 10,
    proYearlyPrice: 129,
    lifetimePrice: 179,
    proYearlyDiscountId: 'ede829e3-a037-437b-964e-f007c14ae4f8', // PRO129
    lifetimeDiscountId: '8fb0f59e-13b0-4440-8eb9-731f29fc3f57', // LIFETIME179
  },
  { minSales: 50, proYearlyPrice: 169, lifetimePrice: 199 },
]

// Whitelist of discount ids the checkout route is allowed to apply — never trust a client-supplied
// discountId that isn't one of these, even though it's server-computed in the normal flow.
export const KNOWN_DISCOUNT_IDS = new Set(
  PRICING_TIERS.flatMap((tier) => [tier.proYearlyDiscountId, tier.lifetimeDiscountId]).filter(
    (id): id is string => !!id,
  ),
)

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

export const POLAR_PRODUCTS = {
  proYearly: process.env.NEXT_PUBLIC_POLAR_PRO_YEARLY_ID || '',
  allAccessLifetime: process.env.NEXT_PUBLIC_POLAR_LIFETIME_ID || '',
  templateImmersiveLens: process.env.NEXT_PUBLIC_POLAR_TEMPLATE_IMMERSIVE_ID || '',
}
