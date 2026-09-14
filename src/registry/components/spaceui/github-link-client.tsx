'use client'

import { Button } from '@/registry/primitives/button'
import { siteConfig } from '@/config/space-config'
import { IconBrandGithub } from '@tabler/icons-react'
import type * as React from 'react'
import { Link } from '@/registry/primitives/link'

export function GitHubLinkClient({ stars }: { stars: React.ReactNode }) {
  return (
    <Link
      className="relative h-10 px-[calc(--spacing(3.5)-1px)] sm:h-9 shadow-none max-sm:w-9"
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
