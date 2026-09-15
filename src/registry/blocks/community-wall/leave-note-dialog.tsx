'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPortal,
  DialogViewport,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/registry/primitives/dialog'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Textarea } from '@/registry/primitives/textarea'
import { Input } from '@/registry/primitives/input'
import { Slider } from '@/registry/primitives/slider'
import { RadioGroup, Radio } from '@/registry/primitives/radio-group'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { CommunityWallCard } from './community-wall-card'
import { patterns } from './patterns'
import {
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react'
import { Github, Google } from './social-icons'
import { loading, confirm, deny } from '@usespaceui/sounds'
import { createClient } from '@/integrations/supabase/client'
import { cn } from '@/registry/lib/utils'

interface LeaveNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: any
  avatarSource?: 'user' | 'spaceui' | 'auto'
  onSubmitNote: (note: {
    creator_name: string
    message: string
    pattern_index: number
    rotation: number
    creator_avatar_url?: string | null
  }) => Promise<boolean | void>
}

const config = {
  maxCommentLength: 110,
  rotation: {
    startAt: -10,
    default: 0,
    endAt: 10,
    step: 1,
  },
}

export function LeaveNoteDialog({
  open,
  onOpenChange,
  user,
  avatarSource = 'auto',
  onSubmitNote,
}: LeaveNoteDialogProps) {
  const [isGuest, setIsGuest] = useState(false)
  const [patternIndex, setPatternIndex] = useState(() => Math.floor(Math.random() * patterns.length))
  const [rotation, setRotation] = useState(config.rotation.default)
  const [comment, setComment] = useState('')
  const [authorName, setAuthorName] = useState(user?.user_metadata?.name || user?.name || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (user?.user_metadata?.name || user?.name) {
        setAuthorName(user.user_metadata?.name || user.name)
      }
    } else {
      setIsGuest(false)
    }
  }, [open, user])

  const handlePrevPattern = () => {
    setPatternIndex((prev) => (prev - 1 + patterns.length) % patterns.length)
  }

  const handleNextPattern = () => {
    setPatternIndex((prev) => (prev + 1) % patterns.length)
  }

  const handleOAuthSignIn = (provider: 'github' | 'google') => {
    const url = new URL(`${window.location.origin}/api/auth/login`)
    url.searchParams.set('provider', provider)
    url.searchParams.set('next', window.location.pathname)
    window.location.href = url.toString()
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!comment.trim()) {
      try {
        deny()
      } catch {}
      return
    }

    if (comment.length > config.maxCommentLength) {
      try {
        deny()
      } catch {}
      return
    }

    try {
      loading()
    } catch {}
    setIsSubmitting(true)

    try {
      const res = await onSubmitNote({
        creator_name: authorName.trim() || 'Anonymous',
        message: comment.trim(),
        pattern_index: patternIndex,
        rotation: rotation,
        creator_avatar_url: user?.user_metadata?.avatar_url || user?.avatarUrl,
      })

      if (res !== false) {
        try {
          confirm()
        } catch {}
        setComment('')
        setPatternIndex(Math.floor(Math.random() * patterns.length))
        setRotation(config.rotation.default)
        onOpenChange(false)
      }
    } catch (err) {
      try {
        deny()
      } catch {}
    } finally {
      setIsSubmitting(false)
    }
  }

  const canLeaveNote = Boolean(user) || isGuest

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogViewport className="p-4 sm:p-6">
          {!canLeaveNote ? (
            /* Authentication selection step: 2 original OAuth buttons + 1 Guest button */
            <DialogPopup
              className="w-full max-w-md flex flex-col overflow-hidden rounded-3xl bg-popover text-popover-foreground p-6 squircle border-4 border-muted"
              showCloseButton={false}
            >
              <DialogHeader className="shrink-0 flex-row justify-between items-center p-0 pb-4 border-b border-border/40">
                <DialogTitle className="text-2xl font-bold text-start">Sign in to leave a note</DialogTitle>
                <DialogClose render={<Button size="icon-sm" className="rounded-lg" />}>
                  <IconX className="size-5" />
                </DialogClose>
              </DialogHeader>

              <div className="flex flex-col gap-6 pt-3">
                <p className="text-muted-foreground text-center">
                  Connect with your GitHub or Google account, or continue as a guest to leave a note on the community
                  wall.
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="default"
                    size="lg"
                    hover
                    whileTap
                    pointer
                    className="w-full flex items-center justify-center gap-2.5 h-11"
                    onClick={() => handleOAuthSignIn('github')}
                  >
                    <Github size={20} className="shrink-0" />
                    <span>Continue with GitHub</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    hover
                    whileTap
                    pointer
                    className="w-full flex items-center justify-center gap-2.5 h-11"
                    onClick={() => handleOAuthSignIn('google')}
                  >
                    <Google size={20} className="shrink-0" />
                    <span>Continue with Google</span>
                  </Button>

                  <div className="relative my-2 flex items-center justify-center">
                    <div className="border-t border-border/60 w-full" />
                    <span className="bg-popover px-2 text-xs text-muted-foreground uppercase tracking-wider absolute">
                      or
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    hover
                    whileTap
                    pointer
                    className="w-full flex items-center justify-center gap-2.5 h-11"
                    onClick={() => setIsGuest(true)}
                  >
                    <IconUserFilled className="size-5" />
                    <span>Continue as Guest</span>
                  </Button>
                </div>
              </div>
            </DialogPopup>
          ) : (
            /* Note creation form */
            <DialogPopup
              className="w-full max-w-3xl max-h-[90dvh] flex flex-col overflow-hidden rounded-3xl bg-popover text-popover-foreground p-6 squircle border-4 border-muted"
              showCloseButton={false}
            >
              <DialogHeader className="shrink-0 flex-row justify-between items-center p-0 pb-4 border-b border-border/40">
                <DialogTitle className="text-2xl font-bold text-start">Leave a Note</DialogTitle>
                <DialogClose render={<Button size="icon-sm" className="rounded-lg" />}>
                  <IconX className="size-5" />
                </DialogClose>
              </DialogHeader>

              <form id="leave-note-form" onSubmit={onSubmit} className="flex-1 min-h-0 flex flex-col">
                <ScrollArea className="flex-1 min-h-0 py-6 pr-2 overflow-x-hidden">
                  <div className="flex flex-col md:grid md:grid-cols-2 gap-8 items-start">
                    <div className="w-full order-1 md:order-2 flex flex-col items-center justify-center">
                      <div className="relative flex items-center justify-center w-full max-w-[340px] px-8 py-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePrevPattern}
                          aria-label="Previous pattern"
                          className="absolute bg-background left-0 top-1/2 -translate-y-1/2 z-20"
                          pointer
                        >
                          <IconChevronLeft className="size-5" />
                        </Button>

                        <div className="relative flex items-center justify-center">
                          <CommunityWallCard
                            patternIndex={patternIndex}
                            author={authorName || 'You'}
                            profilePicture={user?.user_metadata?.avatar_url || user?.avatarUrl}
                            rotation={rotation}
                            avatarSource={avatarSource}
                            message={comment || 'Your note preview will appear here...'}
                            className="h-88 w-64 select-none"
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleNextPattern}
                          aria-label="Next pattern"
                          className="absolute bg-background right-0 top-1/2 -translate-y-1/2 z-20"
                          pointer
                        >
                          <IconChevronRight className="size-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="w-full order-2 md:order-1 space-y-4">
                      {!user?.user_metadata?.name && !user?.name && (
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-foreground">Your Name</label>
                          <Input
                            placeholder="Your name or handle"
                            value={authorName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthorName(e.target.value)}
                            maxLength={40}
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-foreground">Your Note</label>
                          <Badge variant="secondary" size="xs" squircle>
                            {comment.length} / {config.maxCommentLength}
                          </Badge>
                        </div>
                        <Textarea
                          name="comment"
                          placeholder="Write your note here..."
                          rows={6}
                          value={comment}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                          required
                          maxLength={config.maxCommentLength}
                          className="resize-none"
                        />
                      </div>

                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium min-w-16">Rotation</label>
                          <Slider
                            value={rotation}
                            min={config.rotation.startAt}
                            max={config.rotation.endAt}
                            step={config.rotation.step}
                            onValueChange={(value: any) => {
                              const newValue = Array.isArray(value) ? value[0] : value
                              setRotation(newValue as number)
                            }}
                            className="flex-1"
                          />
                          <Badge variant="secondary" squircle size="sm" className="w-12 justify-center">
                            {rotation}°
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium min-w-16">Pattern</label>
                          <RadioGroup
                            value={patternIndex.toString()}
                            onValueChange={(value: any) => setPatternIndex(parseInt(value))}
                            className="flex gap-2 flex-1 flex-row flex-wrap"
                          >
                            {patterns.map((p, index) => (
                              <Radio key={index} value={index.toString()} aria-label={`Pattern ${p.name || index + 1}`} />
                            ))}
                          </RadioGroup>
                        </div>
                      </div>

                      <div className="hidden md:flex gap-2 pt-4 mt-auto">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setComment('')
                            onOpenChange(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="default"
                          className="flex-1"
                          disabled={!comment.trim() || isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="flex md:hidden md:shrink-0 gap-2 pt-4 border-t border-border/40 mt-auto">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setComment('')
                      onOpenChange(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" className="flex-1" disabled={!comment.trim() || isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </form>
            </DialogPopup>
          )}
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  )
}
