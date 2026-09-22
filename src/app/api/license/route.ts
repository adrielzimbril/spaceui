import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseConfig } from '@/integrations/supabase/client'
import { createAdminClient } from '@/integrations/supabase/server'
import { generateSignedLicenseToken } from '@/lib/token-security'
import { logger } from '@/registry/utils/logger'

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

    const plan: 'pro_lifetime' | 'pro_annual' = metadata.plan === 'lifetime' ? 'pro_lifetime' : 'pro_annual'

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Reuse an existing active key so re-fetching the license doesn't invalidate a
    // token the user already put in their components.json.
    const { data: existing } = await (admin as any)
      .from('license_keys')
      .select('key')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let token: string = existing?.key

    if (!token) {
      token = generateSignedLicenseToken({ sub: user.email || user.id, plan, iat: Date.now() })
      const { error: insertError } = await (admin as any).from('license_keys').insert({
        user_id: user.id,
        key: token,
        plan,
        status: 'active',
      })
      if (insertError) {
        logger.error('[/api/license] Failed to persist license key:', insertError)
        return NextResponse.json({ error: 'Failed to issue license key' }, { status: 500 })
      }
    }

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
    if (
      err?.digest === 'HANGING_PROMISE_REJECTION' ||
      err?.digest?.startsWith('DYNAMIC_SERVER_USAGE') ||
      err?.message?.includes('During prerendering')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('[/api/license] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
