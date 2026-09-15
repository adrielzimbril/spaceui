'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/registry/lib/utils'
import { CommunityWallCard, type CommunityMessage } from './community-wall-card'
import { InfiniteCanvas } from './infinite-canvas'
import { LeaveNoteDialog } from './leave-note-dialog'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'
export { CommunityWallCard, type CommunityMessage } from './community-wall-card'
export { InfiniteCanvas } from './infinite-canvas'
export { LeaveNoteDialog } from './leave-note-dialog'
export { patterns } from './patterns'

export interface CommunityWallProps {
  messages?: CommunityMessage[]
  onAddNote?: (note: {
    creator_name: string
    message: string
    pattern_index: number
    rotation: number
    creator_avatar_url?: string | null
  }) => Promise<boolean | void>
  className?: string
  height?: string | number
  user?: any
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showFloatingButton?: boolean
  avatarSource?: 'user' | 'spaceui' | 'auto'
}

export function CommunityWall({
  messages: externalMessages,
  onAddNote,
  className,
  height,
  user,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showFloatingButton = true,
  avatarSource = 'auto',
}: CommunityWallProps) {
  const [messages, setMessages] = useState<CommunityMessage[]>(externalMessages ?? [])
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = setControlledOpen || setInternalOpen

  useEffect(() => {
    if (externalMessages !== undefined) {
      setMessages(externalMessages)
    }
  }, [externalMessages])

  const handleAddNote = async (newNote: {
    creator_name: string
    message: string
    pattern_index: number
    rotation: number
    creator_avatar_url?: string | null
  }) => {
    if (onAddNote) {
      const success = await onAddNote(newNote)
      if (success === false) return false
    }

    const created: CommunityMessage = {
      id: 'local-' + Date.now(),
      creator_name: newNote.creator_name,
      message: newNote.message,
      patternIndex: newNote.pattern_index,
      pattern_index: newNote.pattern_index,
      rotation: newNote.rotation,
      creator_avatar_url: newNote.creator_avatar_url,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [created, ...prev])
    return true
  }

  return (
    <div
      style={height ? { height: typeof height === 'number' ? `${height}px` : height } : undefined}
      className={cn('relative size-full', className)}
    >
      {/* Floating Leave Note Trigger Button */}
      {showFloatingButton && (
        <div className="absolute top-4 left-4 z-20">
          <Button
            variant="default"
            size="lg"
            hover
            whileTap
            onClick={() => setOpen(true)}
            pointer
            className="flex items-center px-6 py-4"
          >
            <div className="relative">
              <StatusBadge
                status={user ? 'online' : 'busy'}
                showIndicator
                animated
                size="sm"
                className="bg-inherit [&_div]:squircle! [&_div]:rounded-7xl! p-0"
              />
            </div>
            <span className="text-sm font-medium">Leave a Note</span>
          </Button>
        </div>
      )}

      {/* Mobile: Grid layout */}
      <div className="size-full block md:hidden overflow-y-auto pt-16">
        <div className="flex flex-wrap justify-center gap-8 p-6 pb-24">
          {messages.map((msg) => (
            <CommunityWallCard
              key={msg.id}
              message={msg.message}
              patternIndex={msg.patternIndex ?? msg.pattern_index ?? 0}
              author={msg.creator_name || msg.author}
              profilePicture={msg.creator_avatar_url || msg.profilePicture}
              rotation={msg.rotation}
              avatarSource={avatarSource}
              className="h-75 w-63"
            />
          ))}
        </div>
      </div>

      {/* Desktop: Infinite canvas */}
      <div className="size-full hidden md:block">
        <InfiniteCanvas messages={messages} avatarSource={avatarSource} />
      </div>

      {/* Exact CommentForm Modal */}
      <LeaveNoteDialog
        open={open}
        onOpenChange={setOpen}
        user={user}
        avatarSource={avatarSource}
        onSubmitNote={handleAddNote}
      />
    </div>
  )
}
