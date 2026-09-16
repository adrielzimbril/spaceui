'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/registry/primitives/breadcrumb'
import { cn } from '@/registry/lib/utils'

const SEGMENT_LABELS: Record<string, string> = {
  docs: 'Docs',
  'ui-kit': 'Library',
  primitives: 'Primitives',
  components: 'Components',
  spaceui: 'Space UI',
  backgrounds: 'Backgrounds',
  blocks: 'Blocks',
  hooks: 'Hooks',
  icons: 'Icons',
}

function formatSegment(segment: string): string {
  return SEGMENT_LABELS[segment.toLowerCase()] || segment.replace(/-/g, ' ')
}

export interface DocsBreadcrumbProps {
  className?: string
  slug?: string[]
  rootLabel?: string
  rootHref?: string
}

export function DocsBreadcrumb({ className, slug, rootLabel = 'Home', rootHref = '/' }: DocsBreadcrumbProps) {
  const pathname = usePathname()
  const segments = slug && slug.length > 0 ? slug : (pathname || '').split('/').filter(Boolean)

  return (
    <Breadcrumb className={cn('text-xs text-muted-foreground', className)}>
      <BreadcrumbList className="gap-1.5 text-xs">
        <BreadcrumbItem>
          <BreadcrumbLink href={rootHref} className="capitalize hover:text-foreground transition-colors">
            {rootLabel}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.length > 0 && <BreadcrumbSeparator />}
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          const href = `/${segments.slice(0, index + 1).join('/')}`
          const formatted = formatSegment(segment)

          return (
            <React.Fragment key={`${segment}-${index}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium text-foreground capitalize truncate max-w-[200px] sm:max-w-none">
                    {formatted}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href} className="capitalize hover:text-foreground transition-colors">
                    {formatted}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
