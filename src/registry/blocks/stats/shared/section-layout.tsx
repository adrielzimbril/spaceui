'use client'

import * as React from 'react'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { cn } from '@/registry/lib/utils'

export interface SectionHeaderProps {
  title?: string
  description?: string
  link?: string
  badge?: string
  layoutStart?: boolean
  isPage?: boolean
}

export function SectionHeader({ title, description, link, badge, layoutStart, isPage }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'max-w-2xl flex flex-col items-start justify-start gap-4 mb-12',
        !layoutStart && 'mx-auto items-center justify-center text-center',
      )}
    >
      {badge && (
        <Badge
          size="md"
          className="squircle-2xl/80 md:squircle-3xl/80 px-3 py-1.5 border-none bg-muted text-foreground font-semibold text-base"
        >
          {badge}
        </Badge>
      )}

      {title && (
        <h2
          className={cn(
            layoutStart ? 'text-2xl md:text-3xl font-normal' : 'capitalize text-3xl md:text-4xl font-bold',
            isPage && 'font-normal',
          )}
        >
          {title}
        </h2>
      )}

      {description && (
        <p
          className={cn('text-xl md:text-2xl text-muted-foreground whitespace-pre-line', !layoutStart && 'font-medium')}
        >
          {description}
        </p>
      )}

      {link && (
        <a
          href={link}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          See more &rarr;
        </a>
      )}
    </div>
  )
}

export interface SectionLayoutProps {
  id?: string
  title?: string
  description?: string
  className?: string
  contentClassName?: string
  link?: string
  badge?: string
  children: React.ReactNode
  isFlex?: boolean
  layoutStart?: boolean
  isPage?: boolean
}

export function SectionLayout({
  id,
  title,
  description,
  className,
  contentClassName,
  link,
  badge,
  children,
  isFlex,
  layoutStart,
  isPage,
}: SectionLayoutProps) {
  return (
    <section className={cn('relative w-full py-14 md:py-[104px]', className)} id={id}>
      {(title || badge) && (
        <SectionHeader
          title={title}
          description={description}
          link={link}
          badge={badge}
          layoutStart={layoutStart}
          isPage={isPage}
        />
      )}
      <div
        className={cn(
          'flex flex-col items-center justify-center justify-items-center self-center place-self-center w-full gap-6',
          !isFlex && 'md:grid grid-cols-1 md:grid-cols-2 md:max-w-[90%] place-items-center place-self-center',
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  )
}
