import { NextRequest, NextResponse } from 'next/server'
import { polar } from '@/lib/polar'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const products = searchParams.get('products')

  if (!products) {
    return NextResponse.json({ error: 'Missing products in query parameter' }, { status: 400 })
  }

  const customerEmail = searchParams.get('customerEmail') ?? undefined
  const customerId = searchParams.get('customerId') ?? undefined
  const externalCustomerId = searchParams.get('customerExternalId') ?? undefined
  const successUrl = searchParams.get('successUrl') ?? undefined

  try {
    const checkout = await polar.checkouts.create({
      products: products.split(','),
      customerEmail,
      customerId,
      externalCustomerId,
      successUrl,
    })

    return NextResponse.redirect(checkout.url)
  } catch (error) {
    console.error('Error creating Polar checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
