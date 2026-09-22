import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/integrations/supabase/server'
import { logger } from '@/registry/utils/logger'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/community'

  const redirectUrl = `${origin}${next.startsWith('/') ? next : `/${next}`}`

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data?.user) {
        return NextResponse.redirect(redirectUrl)
      }
      if (error) {
        logger.error('Supabase auth callback error:', error)
      }
    }
  }

  return NextResponse.redirect(redirectUrl)
}
