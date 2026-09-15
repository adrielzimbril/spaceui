import { cookies } from 'next/headers'
import { createClient } from '@/integrations/supabase/server'

export interface UserSubscriptionStatus {
  isPro: boolean
  plan: 'free' | 'pro' | 'lifetime'
  status?: string
  currentPeriodEnd?: string | null
  polarCustomerId?: string | null
  unlockedProducts: string[]
}

export async function getCurrentUserSubscription(): Promise<UserSubscriptionStatus> {
  const defaultStatus: UserSubscriptionStatus = {
    isPro: false,
    plan: 'free',
    unlockedProducts: [],
  }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    if (!supabase) return defaultStatus

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return defaultStatus

    const appMeta = (user.app_metadata || {}) as any
    const plan = appMeta.plan ?? (appMeta.has_paid ? 'pro' : 'free')
    const isPro = plan === 'pro' || plan === 'lifetime' || appMeta.subscription_status === 'active'
    const unlockedProducts: string[] = Array.isArray(appMeta.unlocked_products)
      ? appMeta.unlocked_products
      : []

    return {
      isPro,
      plan: isPro ? plan : 'free',
      status: appMeta.subscription_status,
      currentPeriodEnd: appMeta.current_period_end ?? null,
      polarCustomerId: appMeta.polar_customer_id ?? null,
      unlockedProducts,
    }
  } catch (error) {
    console.error('Error getting user subscription status:', error)
    return defaultStatus
  }
}

/**
 * Checks if the current user has access to a specific item (template, kit, etc.)
 * Access is granted if:
 * 1. User has an active Pro / Lifetime subscription
 * 2. OR User purchased this specific product at fixed price
 */
export async function hasProductAccess(productId: string): Promise<boolean> {
  const subscription = await getCurrentUserSubscription()
  if (subscription.isPro) return true
  return subscription.unlockedProducts.includes(productId)
}

