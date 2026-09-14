'use client'

import * as React from 'react'
import Link from 'next/link'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'
import { AssetEmoji } from '@/tools/emoji/asset-emoji'
import { EmojiSource, EmojiType } from '@usespaceui/emoji'
import { Avatar } from '@usespaceui/avatars/react'
import type { AvatarVariant } from '@usespaceui/avatars'
import { useMediaQuery } from '@/registry/hooks/browser/use-media-query'
import { cn } from '@/registry/lib/utils'

export interface HeroAvatarProps {
  name?: string
  variant?: AvatarVariant
  size?: number
  animate?: boolean
  className?: string
}

export function HeroAvatar({ name = 'space', variant = 'lumina', animate = false, size, className }: HeroAvatarProps) {
  const isLg = useMediaQuery('(min-width: 1024px)', true)
  const isMd = useMediaQuery('(min-width: 768px)', true)
  const isSm = useMediaQuery('(min-width: 640px)', true)
  const autoSize = isLg ? 75 : isMd ? 68 : isSm ? 56 : 38
  const resolvedSize = size ?? autoSize

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center px-2 size-12.5 sm:size-16.5 md:size-20 lg:size-22 shrink-0 overflow-visible',
        className,
      )}
    >
      <Avatar
        name={name}
        variant={variant}
        // size={resolvedSize}
        size={resolvedSize}
        circle
        animate={animate}
        className="relative flex size-full aspect-square overflow-hidden -bottom-2.5 [&_svg]:size-full! [&_svg]:absolute [&_svg]:object-cover pointer-events-none"
      />
    </span>
  )
}

export interface MarketingHeroStatusBadge {
  primaryText: string
  secondaryText?: string
  emojiCodepoint?: string
  href?: string
}

export interface MarketingHeroProps {
  statusBadge?: MarketingHeroStatusBadge
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
  containerClassName?: string
}

export function MarketingHero({
  statusBadge,
  title,
  description,
  children,
  className,
  containerClassName,
}: MarketingHeroProps) {
  const badgeContent = statusBadge && (
    <StatusBadge
      variant="outline"
      status="online"
      size="lg"
      primaryText={statusBadge.primaryText}
      className="select-none bg-background border-none cursor-pointer transition-colors"
      secondaryTextClassName="inline-flex items-center gap-1.5 pr-1"
    >
      {statusBadge.secondaryText}
      {statusBadge.emojiCodepoint && (
        <AssetEmoji
          codepoint={statusBadge.emojiCodepoint}
          source={EmojiSource.Fluent}
          type={EmojiType.Anim}
          size={22}
          lazy={false}
        />
      )}
    </StatusBadge>
  )

  return (
    <section className={cn('relative overflow-hidden pt-24 pb-8 md:pb-12', className)}>
      <div
        className={cn(
          'bg-muted rounded-5xl mx-2 md:mx-auto pt-12 pb-16 md:pt-20 md:pb-24 max-w-310 px-5 sm:px-6',
          containerClassName,
        )}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {statusBadge && (
            <div className="inline-flex items-center">
              {statusBadge.href ? (
                <Link href={statusBadge.href} className="inline-flex items-center group outline-none">
                  {badgeContent}
                </Link>
              ) : (
                badgeContent
              )}
            </div>
          )}

          <h1 className="mt-7 max-w-5xl text-balance text-[36px] font-semibold tracking-tight leading-[1.08] text-foreground sm:text-[54px] md:text-[66px] lg:text-[76px]">
            {title}
          </h1>

          {description && (
            <p className="mt-6 max-w-[58ch] text-balance text-lg leading-relaxed tracking-tight text-muted-foreground sm:text-xl">
              {description}
            </p>
          )}

          {children && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">{children}</div>
          )}
        </div>
      </div>
    </section>
  )
}
