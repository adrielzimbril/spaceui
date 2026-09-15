import { NextRequest, NextResponse } from 'next/server'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'

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

  switch (event.type) {
    case 'order.paid':
      // TODO: Fulfill order in database / grant access / trigger order confirmation
      // const order = event.data
      break

    case 'order.created':
      // Initial order created
      break

    case 'customer.state_changed':
      // TODO: Update customer state, sync user entitlements & permissions
      // const customerState = event.data
      break

    case 'checkout.created':
      // Checkout initiated
      break

    case 'subscription.created':
    case 'subscription.updated':
    case 'subscription.canceled':
      // TODO: Synchronize user subscription status in database
      // const subscription = event.data
      break

    default:
      // Other unhandled events
      break
  }

  return NextResponse.json({ received: true })
}
