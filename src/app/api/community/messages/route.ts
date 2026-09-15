import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/integrations/supabase/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore) || createAdminClient()

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database client not configured', messages: [] },
        { status: 503 },
      )
    }

    const { data, error } = await supabase
      .from('community_wall')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('[Community Messages GET Error]', error)
      return NextResponse.json({ success: false, error: error.message, messages: [] }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messages: data || [],
    })
  } catch (err: any) {
    console.error('[Community Messages GET Exception]', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch messages', messages: [] },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { creator_name, message, pattern_index, rotation, creator_avatar_url } = body

    if (!creator_name || typeof creator_name !== 'string' || !creator_name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }

    if (message.trim().length > 140) {
      return NextResponse.json({ success: false, error: 'Message exceeds 140 characters limit' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const admin = createAdminClient()
    const dbClient = admin || supabase

    if (!dbClient) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 })
    }

    // Check optional authenticated user session
    let userId: string | null = null
    let isVerified = false
    let finalAvatarUrl = creator_avatar_url?.trim() || null

    if (supabase) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          userId = user.id
          isVerified = true
          if (!finalAvatarUrl && user.user_metadata?.avatar_url) {
            finalAvatarUrl = user.user_metadata.avatar_url
          }
        }
      } catch (authErr) {
        // Guest fallback
      }
    }

    const payload = {
      user_id: userId,
      creator_name: creator_name.trim().slice(0, 40),
      creator_avatar_url: finalAvatarUrl,
      message: message.trim(),
      pattern_index: typeof pattern_index === 'number' ? Math.max(0, Math.min(5, pattern_index)) : 0,
      rotation: typeof rotation === 'number' ? Math.max(-15, Math.min(15, rotation)) : 0,
      is_verified: isVerified,
    }

    const { data, error } = await dbClient
      .from('community_wall')
      .insert(payload as any)
      .select()
      .single()

    if (error) {
      console.error('[Community Messages POST Error]', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: data,
    })
  } catch (err: any) {
    console.error('[Community Messages POST Exception]', err)
    return NextResponse.json({ success: false, error: err?.message || 'Failed to submit message' }, { status: 500 })
  }
}
