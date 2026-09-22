import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { polar } from '@/lib/polar'
import { createClient } from '@/integrations/supabase/server'
import { logger } from '@/registry/utils/logger'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  if (!supabase) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const polarCustomerId = (user.app_metadata as any)?.polar_customer_id

  try {
    let customerIdToUse = polarCustomerId

    if (!customerIdToUse) {
      // Lookup customer by external user id
      const customers = await polar.customers.list({
        externalId: user.id,
      })
      const found = customers.result.items[0]
      if (found) {
        customerIdToUse = found.id
      }
    }

    if (!customerIdToUse && user.email) {
      // Lookup customer by email
      const customers = await polar.customers.list({
        email: user.email,
      })
      const found = customers.result.items[0]
      if (found) {
        customerIdToUse = found.id
      }
    }

    if (!customerIdToUse) {
      return NextResponse.redirect(new URL('/pricing?message=no-subscription', request.url))
    }

    const session = await polar.customerSessions.create({
      customerId: customerIdToUse,
    })

    return NextResponse.redirect(session.customerPortalUrl)
  } catch (error: any) {
    logger.error('Failed to create Polar customer portal session:', error)
    return NextResponse.redirect(new URL('/pricing?error=portal-error', request.url))
  }
}
