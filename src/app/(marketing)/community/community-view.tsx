'use client'

import * as React from 'react'
import { CommunityWall, type CommunityMessage } from '@/registry/blocks/community-wall'
import { StatsSection } from './stats-section'

interface CommunityViewProps {
  initialMessages?: CommunityMessage[]
}

export function CommunityView({ initialMessages = [] }: CommunityViewProps) {
  const [messages, setMessages] = React.useState<CommunityMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = React.useState(initialMessages.length === 0)

  // Fetch messages from API on client mount
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

  const [isLeaveNoteOpen, setIsLeaveNoteOpen] = React.useState(false)

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Stats Section at the top on real community page with centered Leave a Note button */}
      <StatsSection
        totalMessages={stats.totalMessages}
        uniqueMembers={stats.uniqueMembers}
        weekMessages={stats.weekMessages}
        isLoading={isLoading}
        onLeaveNote={() => setIsLeaveNoteOpen(true)}
      />

      {/* Community Wall Infinite Canvas */}
      <CommunityWall
        messages={messages}
        onAddNote={handleAddNote}
        open={isLeaveNoteOpen}
        onOpenChange={setIsLeaveNoteOpen}
        showFloatingButton={false}
        height="48rem"
        className="h-160 sm:h-180 lg:h-195"
      />
    </div>
  )
}
