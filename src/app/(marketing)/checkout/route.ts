import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { polar } from '@/lib/polar'
import { createClient } from '@/integrations/supabase/server'
import { KNOWN_DISCOUNT_IDS } from '@/lib/pricing-config'
import { logger } from '@/registry/utils/logger'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const products = searchParams.get('products')
  const requestedDiscountId = searchParams.get('discountId')
  const discountId =
    requestedDiscountId && KNOWN_DISCOUNT_IDS.has(requestedDiscountId) ? requestedDiscountId : undefined

  if (!products) {
    return NextResponse.json({ error: 'Missing products in query parameter' }, { status: 400 })
  }

  // Check if current user is authenticated in Supabase
  let authenticatedUserId: string | undefined
  let authenticatedEmail: string | undefined

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        authenticatedUserId = user.id
        authenticatedEmail = user.email
      }
    }
  } catch (err) {
    logger.error('Failed to retrieve Supabase session during checkout:', err)
  }

  const customerEmail = authenticatedEmail ?? searchParams.get('customerEmail') ?? undefined
  const externalCustomerId = authenticatedUserId ?? searchParams.get('customerExternalId') ?? undefined
  const customerId = searchParams.get('customerId') ?? undefined

  const origin = request.nextUrl.origin
  const successUrl = searchParams.get('successUrl') ?? `${origin}/checkout/success?checkout_id={CHECKOUT_ID}`

  try {
    const checkout = await polar.checkouts.create({
      products: products.split(','),
      discountId,
      customerEmail,
      customerId,
      externalCustomerId,
      successUrl,
    })

    return NextResponse.redirect(checkout.url)
  } catch (error: any) {
    logger.error('Error creating Polar checkout session:', error)
    return NextResponse.json({ error: error?.message || 'Failed to create checkout session' }, { status: 500 })
  }
}
