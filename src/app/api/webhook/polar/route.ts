import { NextRequest, NextResponse } from 'next/server'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { createAdminClient } from '@/integrations/supabase/server'

export async function POST(request: NextRequest) {
  const secret = process.env.POLAR_WEBHOOK_SECRET

  if (!secret) {
    console.error('POLAR_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const rawBody = await request.text()

  const webhookHeaders = {
    'webhook-id': request.headers.get('webhook-id') ?? '',
    'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
    'webhook-signature': request.headers.get('webhook-signature') ?? '',
  }

  let event: ReturnType<typeof validateEvent>
  try {
    event = validateEvent(rawBody, webhookHeaders, secret)
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ received: false, error: 'Invalid signature' }, { status: 403 })
    }
    console.error('Unexpected webhook error:', error)
    return NextResponse.json({ received: false, error: 'Webhook processing error' }, { status: 500 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'order.paid': {
        const order = event.data as any
        const customer = order.customer
        const externalId = customer?.externalId || order.metadata?.userId
        const productId = order.productId

        if (supabase && (externalId || customer?.email)) {
          let targetUserId = externalId
          let userMetadata: any = {}

          if (!targetUserId && customer?.email) {
            const { data } = await supabase.auth.admin.listUsers()
            const match = data?.users.find((u) => u.email?.toLowerCase() === customer.email.toLowerCase())
            if (match) {
              targetUserId = match.id
              userMetadata = match.app_metadata || {}
            }
          } else if (targetUserId) {
            const { data } = await supabase.auth.admin.getUserById(targetUserId)
            if (data?.user) {
              userMetadata = data.user.app_metadata || {}
            }
          }

          if (targetUserId) {
            const existingUnlocked: string[] = Array.isArray(userMetadata.unlocked_products)
              ? userMetadata.unlocked_products
              : []

            const updatedUnlocked = productId && !existingUnlocked.includes(productId)
              ? [...existingUnlocked, productId]
              : existingUnlocked

            // Check if this order grants full lifetime access
            const isLifetime =
              order.metadata?.plan === 'lifetime' ||
              order.product?.name?.toLowerCase().includes('lifetime') ||
              order.product?.name?.toLowerCase().includes('all-access')

            // Update Supabase auth user app_metadata
            await supabase.auth.admin.updateUserById(targetUserId, {
              app_metadata: {
                ...userMetadata,
                has_paid: true,
                ...(isLifetime ? { plan: 'lifetime' } : {}),
                polar_customer_id: customer?.id || order.customerId,
                last_order_id: order.id,
                unlocked_products: updatedUnlocked,
              },
            })

            // Attempt writing to orders table if configured
            try {
              await (supabase as any).from('orders').upsert({
                id: order.id,
                user_id: targetUserId,
                amount: order.amount,
                currency: order.currency,
                status: 'paid',
                product_id: productId,
                created_at: new Date().toISOString(),
              })
            } catch (tableErr) {
              console.warn('[Polar Webhook] Note: orders table not available or insert failed:', tableErr)
            }
          }
        }
        break
      }

      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.canceled': {
        const sub = event.data as any
        const customer = sub.customer
        const externalId = customer?.externalId || sub.metadata?.userId
        const isActive = sub.status === 'active' || sub.status === 'trialing'

        if (supabase && (externalId || customer?.email)) {
          let targetUserId = externalId

          if (!targetUserId && customer?.email) {
            const { data } = await supabase.auth.admin.listUsers()
            const match = data?.users.find((u) => u.email?.toLowerCase() === customer.email.toLowerCase())
            if (match) targetUserId = match.id
          }

          if (targetUserId) {
            // Update Supabase auth user app_metadata
            await supabase.auth.admin.updateUserById(targetUserId, {
              app_metadata: {
                plan: isActive ? 'pro' : 'free',
                subscription_status: sub.status,
                polar_customer_id: customer?.id || sub.customerId,
                polar_subscription_id: sub.id,
                current_period_end: sub.currentPeriodEnd,
              },
            })

            // Attempt writing to subscriptions table if configured
            try {
              await (supabase as any).from('subscriptions').upsert({
                id: sub.id,
                user_id: targetUserId,
                polar_customer_id: customer?.id || sub.customerId,
                status: sub.status,
                product_id: sub.productId,
                price_id: sub.priceId,
                current_period_end: sub.currentPeriodEnd,
                cancel_at_period_end: sub.cancelAtPeriodEnd ?? false,
                updated_at: new Date().toISOString(),
              })
            } catch (tableErr) {
              console.warn('[Polar Webhook] Note: subscriptions table not available or insert failed:', tableErr)
            }
          }
        }
        break
      }

      default:
        break
    }
  } catch (syncError) {
    console.error('[Polar Webhook] Sync error:', syncError)
    return NextResponse.json({ received: true, syncError: String(syncError) })
  }

  return NextResponse.json({ received: true })
}
