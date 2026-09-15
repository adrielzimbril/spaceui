import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/integrations/supabase/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Logout error:', err)
    return NextResponse.json({ error: err?.message || 'Logout failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    if (supabase) {
      await supabase.auth.signOut()
    }
  } catch (err) {
    console.error('Logout error:', err)
  }

  return NextResponse.redirect(`${origin}/community`)
}
