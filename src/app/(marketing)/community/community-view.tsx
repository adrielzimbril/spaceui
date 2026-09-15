'use client'

import * as React from 'react'
import { CommunityWall, type CommunityMessage } from '@/registry/blocks/community-wall'
import { StatsSection } from './stats-section'
import { createClient } from '@/integrations/supabase/client'

interface CommunityViewProps {
  initialMessages?: CommunityMessage[]
  initialUser?: any
}

export function CommunityView({ initialMessages = [], initialUser = null }: CommunityViewProps) {
  const [messages, setMessages] = React.useState<CommunityMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = React.useState(initialMessages.length === 0)
  const [user, setUser] = React.useState<any>(initialUser)
  const [isLeaveNoteOpen, setIsLeaveNoteOpen] = React.useState(false)

  React.useEffect(() => {
    if (initialUser) {
      setUser(initialUser)
    }
  }, [initialUser])

  React.useEffect(() => {
    const supabase = createClient()

    fetch('/api/auth/user')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})

    if (!supabase) return

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      if (code) {
        supabase.auth
          .exchangeCodeForSession(code)
          .then(({ data, error }) => {
            if (!error && data?.user) {
              setUser(data.user)
            }
            url.searchParams.delete('code')
            window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''))
          })
          .catch((err) => {
            console.error('Failed to exchange auth code:', err)
          })
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true

    async function fetchNotes() {
      try {
        const res = await fetch('/api/community/messages', {
          cache: 'no-store',
        })
        if (!res.ok) return
        const json = await res.json()
        if (json.success && Array.isArray(json.messages) && isMounted) {
          if (json.messages.length > 0) {
            setMessages(json.messages)
          }
        }
      } catch (e) {
        console.error('Failed to load community notes', e)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchNotes()

    return () => {
      isMounted = false
    }
  }, [])

  const stats = React.useMemo(() => {
    const totalMessages = messages.length
    const uniqueMembers = new Set(messages.map((m) => (m.creator_name || m.author || 'Guest').trim())).size
    const oneWeekAgo = Date.now() - 7 * 24 * 3600 * 1000
    const weekMessages = messages.filter((m) => {
      if (!m.created_at) return true
      return new Date(m.created_at).getTime() >= oneWeekAgo
    }).length

    return {
      totalMessages,
      uniqueMembers,
      weekMessages,
    }
  }, [messages])

  const handleAddNote = async (newNote: {
    creator_name: string
    message: string
    pattern_index: number
    rotation: number
    creator_avatar_url?: string | null
  }) => {
    try {
      const res = await fetch('/api/community/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit note')
      }

      if (json.message) {
        setMessages((prev) => [json.message, ...prev])
      }
      return true
    } catch (err: any) {
      console.error('Submit error:', err)
      throw err
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <StatsSection
        totalMessages={stats.totalMessages}
        uniqueMembers={stats.uniqueMembers}
        weekMessages={stats.weekMessages}
        isLoading={isLoading}
        user={user}
        onLeaveNote={() => setIsLeaveNoteOpen(true)}
      />

      <CommunityWall
        messages={messages}
        onAddNote={handleAddNote}
        user={user}
        open={isLeaveNoteOpen}
        onOpenChange={setIsLeaveNoteOpen}
        showFloatingButton={false}
        height="48rem"
        className="h-160 sm:h-180 lg:h-195"
        avatarSource="spaceui"
      />
    </div>
  )
}
