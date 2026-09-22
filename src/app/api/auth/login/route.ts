import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseConfig } from '@/integrations/supabase/client'
import { logger } from '@/registry/utils/logger'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const provider = searchParams.get('provider') as 'github' | 'google'
  const next = searchParams.get('next') ?? '/community'

  if (!provider || (provider !== 'github' && provider !== 'google')) {
    return NextResponse.redirect(`${origin}/community?error=invalid_provider`)
  }

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return NextResponse.redirect(`${origin}/community?error=supabase_not_configured`)
  }

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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      ...(provider === 'google'
        ? {
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          }
        : {}),
    },
  })

  if (error || !data.url) {
    logger.error('OAuth sign in error:', error)
    return NextResponse.redirect(`${origin}/community?error=login_failed`)
  }

  return NextResponse.redirect(data.url)
}
