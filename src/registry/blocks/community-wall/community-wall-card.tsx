'use client'

import React, { useMemo } from 'react'
import { cn } from '@/registry/lib/utils'
import { Card, CardContent } from '@/registry/primitives/card'
import { Avatar as SpaceAvatar } from '@usespaceui/avatars/react'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { patterns } from './patterns'

export interface CommunityMessage {
  id: string
  creator_name?: string
  author?: string
  creator_avatar_url?: string | null
  profilePicture?: string | null
  message: string
  pattern_index?: number
  patternIndex?: number
  rotation?: number
  is_verified?: boolean
  created_at?: string
}

export interface CommunityWallCardProps {
  patternIndex?: number
  message?: string
  rotation?: number
  author?: string
  profilePicture?: string | null
  className?: string
  avatarSource?: 'user' | 'spaceui' | 'auto'
}

export function CommunityWallCard({
  patternIndex = 0,
  message = '',
  rotation = 0,
  author = '',
  profilePicture = '',
  className = '',
  avatarSource = 'auto',
}: CommunityWallCardProps) {
  const pattern = patterns[patternIndex % patterns.length]

  const isSquishmoji = useMemo(() => {
    const seed = author || message || 'guest'
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash) % 2 === 0
  }, [author, message])

  const showUserAvatar = (avatarSource === 'user' || avatarSource === 'auto') && Boolean(profilePicture)

  const avatarNode = useMemo(() => {
    if (showUserAvatar) {
      return <img src={profilePicture!} alt={author || 'Avatar'} className="size-full object-cover" loading="lazy" />
    }
    if (isSquishmoji) {
      return (
        <span className="flex size-full origin-center [&>span]:scnale-[1.55] items-center justify-center">
          <Squishmoji
            seed={author || 'Guest'}
            size={30}
            animate={false}
            shape="all"
            expression="all"
            backgroundStyle="all"
          />
        </span>
      )
    }
    return (
      <span className="flex size-full origin-center items-center justify-center">
        <SpaceAvatar name={author || 'Guest'} variant="all" size={30} />
      </span>
    )
  }, [showUserAvatar, profilePicture, author, isSquishmoji])

  return (
    <Card
      className={cn(
        'bg-card rounded-3xl border-2 border-muted cursor-pointer transition-[border-color,box-shadow] duration-200 group transform-gpu will-change-transform pointer-events-none',
        className,
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <CardContent className="flex flex-col items-start justify-between p-0 gap-3 h-full">
        <div className="relative size-full flex flex-col items-center gap-2 rounded-2xl bg-muted p-2 overflow-hidden">
          <div className="relative size-full flex flex-row items-center justify-center p-4 min-h-50 rounded-2xl bg-card overflow-hidden">
            {pattern?.content}
            <p className="w-full z-10 line-clamp-6 text-center text-xl font-bold text-foreground whitespace-pre-line wrap-break-word">
              {message}
            </p>
          </div>
          <div className="flex w-full items-center gap-2">
            <div className="size-8 shrink-0 overflow-hidden squircle rounded-full bg-background border-2 border-muted flex items-center justify-center">
              {avatarNode}
            </div>
            <p className="truncate text-muted-foreground text-sm font-medium">{author || 'Anonymous'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
