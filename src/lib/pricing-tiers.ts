import { createAdminClient } from '@/integrations/supabase/server'
import { POLAR_PRODUCTS, PRICING_TIERS, type PricingTier } from '@/lib/pricing-config'

const SORTED_TIERS = [...PRICING_TIERS].sort((a, b) => a.minSales - b.minSales)
const BASE_TIER = SORTED_TIERS[0]
const FINAL_TIER = SORTED_TIERS[SORTED_TIERS.length - 1]

export type PricingSnapshot = {
  proYearlyPrice: number
  proYearlyNextPrice: number | null
  proYearlyDiscountPercent: number
  proYearlyDiscountId: string | null
  proYearlySalesCount: number
  proYearlyMilestoneCurrent: number
  proYearlyMilestoneTarget: number | null
  lifetimePrice: number
  lifetimeDiscountId: string | null
  lifetimeSalesCount: number
}

// How far below the final tier's price the given price currently sits, rounded to the nearest percent.
// 0 once the final tier is reached.
function discountPercent(price: number, finalPrice: number) {
  if (finalPrice <= 0 || price >= finalPrice) return 0
  return Math.round(((finalPrice - price) / finalPrice) * 100)
}

function resolveTier(
  salesCount: number,
  priceKey: 'proYearlyPrice' | 'lifetimePrice',
  discountKey: 'proYearlyDiscountId' | 'lifetimeDiscountId',
) {
  const sorted = [...PRICING_TIERS].sort((a, b) => a.minSales - b.minSales)
  let active: PricingTier = sorted[0]
  let next: PricingTier | null = null
  for (const tier of sorted) {
    if (tier.minSales <= salesCount) active = tier
    else if (!next) next = tier
  }
  return {
    price: active[priceKey],
    discountId: active[discountKey] ?? null,
    nextPrice: next ? next[priceKey] : null,
    nextThreshold: next ? next.minSales : null,
  }
}

// Server-only — reads live sales counts from Supabase (via the admin/service-role client) and resolves
// them against PRICING_TIERS. Only call this from Server Components/route handlers, never from a
// client component, since it hits the database with the service-role key.
export async function getPricingSnapshot(): Promise<PricingSnapshot> {
  const supabase = createAdminClient()

  if (!supabase) {
    return {
      proYearlyPrice: BASE_TIER.proYearlyPrice,
      proYearlyNextPrice: BASE_TIER.proYearlyPrice < FINAL_TIER.proYearlyPrice ? FINAL_TIER.proYearlyPrice : null,
      proYearlyDiscountPercent: discountPercent(BASE_TIER.proYearlyPrice, FINAL_TIER.proYearlyPrice),
      proYearlyDiscountId: BASE_TIER.proYearlyDiscountId ?? null,
      proYearlySalesCount: 0,
      proYearlyMilestoneCurrent: 0,
      proYearlyMilestoneTarget: null,
      lifetimePrice: BASE_TIER.lifetimePrice,
      lifetimeDiscountId: BASE_TIER.lifetimeDiscountId ?? null,
      lifetimeSalesCount: 0,
    }
  }

  const [proYearlyResult, lifetimeResult] = await Promise.all([
    (supabase as any)
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', POLAR_PRODUCTS.proYearly)
      .in('status', ['active', 'trialing']),
    (supabase as any)
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', POLAR_PRODUCTS.allAccessLifetime)
      .eq('status', 'paid'),
  ])

  const proYearlySalesCount = proYearlyResult.count ?? 0
  const lifetimeSalesCount = lifetimeResult.count ?? 0

  const proYearlyTier = resolveTier(proYearlySalesCount, 'proYearlyPrice', 'proYearlyDiscountId')
  const lifetimeTier = resolveTier(lifetimeSalesCount, 'lifetimePrice', 'lifetimeDiscountId')

  // The Pro Yearly strikethrough always advertises the final/top-tier price (not just the immediate
  // next tier) — it's a "this is going up to $X eventually" marketing anchor, per user direction.
  const proYearlyNextPrice = proYearlyTier.price < FINAL_TIER.proYearlyPrice ? FINAL_TIER.proYearlyPrice : null

  return {
    proYearlyPrice: proYearlyTier.price,
    proYearlyNextPrice,
    proYearlyDiscountPercent: discountPercent(proYearlyTier.price, FINAL_TIER.proYearlyPrice),
    proYearlyDiscountId: proYearlyTier.discountId,
    proYearlySalesCount,
    proYearlyMilestoneCurrent: proYearlySalesCount,
    proYearlyMilestoneTarget: proYearlyTier.nextThreshold,
    lifetimePrice: lifetimeTier.price,
    lifetimeDiscountId: lifetimeTier.discountId,
    lifetimeSalesCount,
  }
}
