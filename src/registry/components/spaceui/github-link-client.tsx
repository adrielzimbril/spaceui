'use client'

import { siteConfig } from '@/config/space-config'
import { cn } from '@/registry/lib/utils'
import { Link } from '@/registry/primitives/link'
import { IconBrandGithub } from '@tabler/icons-react'
import type * as React from 'react'

export function GitHubLinkClient({ stars, className }: { stars: React.ReactNode; className?: string }) {
  return (
    <Link
      className={cn('relative px-[calc(--spacing(3.5)-1px)] sm:h-8 shadow-none max-sm:w-9', className)}
      href={siteConfig.links.github}
      rel="noreferrer"
      target="_blank"
      asButton
      variant="secondary"
    >
      <IconBrandGithub className="size-4" />
      <span className="max-sm:sr-only">{stars}</span>
    </Link>
  )
}
