import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseConfig } from '@/integrations/supabase/client'

export async function GET() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return NextResponse.json({ user: null })
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
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (err: any) {
    console.error('[/api/auth/user] error:', err)
    return NextResponse.json({ user: null })
  }
}
