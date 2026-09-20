import type * as React from 'react'
import Link from 'next/link'
import { Badge, type BadgeProps } from '@/registry/components/spaceui/badge-squircle'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'
import { HeroBadgeText } from '@/components/marketing/shared/hero-badge-text'
import type { MarketingHeroStatusBadge } from '@/components/marketing/shared/hero'

export function SectionHeader({
  badge,
  badgeVariant,
  statusBadge,
  title,
  description,
}: {
  badge: React.ReactNode
  badgeVariant?: BadgeProps['variant']
  statusBadge?: MarketingHeroStatusBadge
  title: string
  description: string
}) {
  const badgeContent = statusBadge && (
    <StatusBadge
      status="online"
      size="lg"
      primaryText={statusBadge.primaryText}
      className="select-none border-none cursor-pointer transition-colors"
      secondaryTextClassName="inline-flex items-center gap-1.5 pr-1"
    >
      {statusBadge.secondaryText && (
        <HeroBadgeText
          text={statusBadge.secondaryText}
          animate={statusBadge.animate}
          source={statusBadge.source}
          delay={statusBadge.delay}
        />
      )}
    </StatusBadge>
  )
  return (
    <div className="flex flex-col items-center justify-center gap-2 mb-12 text-center">
      {statusBadge ? (
        <div className="inline-flex items-center">
          {statusBadge.href ? (
            <Link href={statusBadge.href} className="inline-flex items-center group outline-none">
              {badgeContent}
            </Link>
          ) : (
            badgeContent
          )}
        </div>
      ) : (
        <Badge variant={badgeVariant} size="md" className="px-3.5 py-1.5 font-semibold text-xs tracking-tight">
          {badge}
        </Badge>
      )}

      <div className="max-w-2xl">
        <h2 className="text-[34px] font-semibold tracking-tight text-foreground sm:text-[46px] md:text-[54px]">
          {title}
        </h2>
        <p className="mt-3 text-base text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
