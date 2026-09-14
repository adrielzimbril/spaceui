'use client'

import { Button } from '@/registry/primitives/button'
import { siteConfig } from '@/config/space-config'
import { IconBrandGithub } from '@tabler/icons-react'
import type * as React from 'react'
import { Link } from '@/registry/primitives/link'
import { cn } from '@/registry/lib/utils'

export function GitHubLinkClient({ stars, className }: { stars: React.ReactNode; className?: string }) {
  return (
    <Link
      className={cn('relative h-10 px-[calc(--spacing(3.5)-1px)] sm:h-9 shadow-none max-sm:w-9', className)}
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
