'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { Frame, FrameHeader } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { cn } from '@/registry/lib/utils'

export interface DocCardProps {
  title?: React.ReactNode
  description?: React.ReactNode
  href?: string
  icon?: React.ReactNode
  badge?: string
  category?: string
  dotColor?: string
  ringColor?: string
  actionLabel?: string
  children?: React.ReactNode
  className?: string
}

export function DocCard({
  title,
  description,
  href,
  icon,
  badge,
  category,
  dotColor = 'bg-blue-400',
  ringColor = 'bg-blue-300',
  actionLabel = 'Explore',
  children,
  className,
}: DocCardProps) {
  const content = (
    <Frame className={cn('flex flex-col h-full not-prose', className)}>
      <FrameHeader className="flex flex-row items-center justify-between px-3 py-1.5">
        <span className="text-xs font-semibold text-muted-foreground tracking-wider truncate">
          {category || 'Guide'}
        </span>
        {badge && (
          <Badge size="xs" variant="secondary" className="bg-background! text-foreground">
            <span className="relative flex justify-center items-center size-fit">
              <span
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping animation-duration-[2.25s]',
                  ringColor,
                )}
              />
              <span className={cn('relative inline-flex rounded-full size-2.5 animate-pulse', dotColor)} />
            </span>
            {badge}
          </Badge>
        )}
      </FrameHeader>

      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden bg-background">
        <CardPanel className="flex-1 flex flex-col justify-between p-4 min-h-36">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              {icon && <div className="shrink-0 text-foreground">{icon}</div>}
              {title && (
                <h4 className="text-sm sm:text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {title}
                </h4>
              )}
            </div>

            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [&_p]:text-xs [&_p]:sm:text-sm [&_p]:leading-relaxed [&_p]:my-0">
                {description}
              </p>
            )}

            {children && !description && (
              <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed [&_p]:text-xs [&_p]:sm:text-sm [&_p]:leading-relaxed [&_p]:my-0">
                {children}
              </div>
            )}
          </div>

          {href && (
            <div className="mt-4 flex items-center justify-between pt-2">
              <span className="text-xs font-medium text-foreground group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                {actionLabel}
                <IconArrowRight className="size-3.5" />
              </span>
            </div>
          )}
        </CardPanel>
      </Card>
    </Frame>
  )

  if (href) {
    const isExternal = href.startsWith('http')
    return (
      <Link
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer noopener' : undefined}
        className="group flex flex-col h-full no-underline outline-none"
        data-space-hover
        data-space-click="open"
      >
        {content}
      </Link>
    )
  }

  return content
}

export function DocCards({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 not-prose', className)}>{children}</div>
}
