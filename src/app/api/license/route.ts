import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseConfig } from '@/integrations/supabase/client'

export async function GET() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    })

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    const metadata = user.app_metadata || {}
    const isPro =
      metadata.has_paid === true ||
      metadata.plan === 'lifetime' ||
      metadata.subscription_status === 'active' ||
      metadata.subscription_status === 'trialing'

    if (!isPro) {
      return NextResponse.json(
        {
          isPro: false,
          message: 'No active Space UI Pro pass found. Upgrade to access Pro components via CLI.',
          pricingUrl: 'https://www.spaceui.one/pricing',
        },
        { status: 403 },
      )
    }

    // Retrieve user session or generated token
    const token = `spaceui_${user.id.substring(0, 12)}`

    return NextResponse.json({
      isPro: true,
      plan: metadata.plan || 'pro',
      token,
      cliConfig: {
        registries: {
          '@spaceui': 'https://www.spaceui.one/r',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    })
  } catch (err: any) {
    console.error('[/api/license] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
