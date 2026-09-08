'use client'

import type { ReactNode } from 'react'
import { IconBrandFigma, IconBrandGithub, IconPuzzle } from '@tabler/icons-react'
import { InlineInstallBar } from '@/components/docs/installation/inline-install-bar'
import { Button } from '@/registry/primitives/button'
import { Group } from '@/registry/primitives/group'
import type { ToolOutboundLinks } from '@/tools/shared/links'

function OutboundIcon({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <Button
      variant="secondary"
      size="icon-lg"
      aria-label={label}
      title={label}
      render={<a href={href} target="_blank" rel="noopener noreferrer" />}
      className="sm:size-10 rounded-lg"
    >
      {children}
    </Button>
  )
}

export function ResourceInstallCluster({
  packageName,
  isShadcn = false,
  links,
}: {
  packageName: string
  isShadcn?: boolean
  links?: ToolOutboundLinks
}) {
  const outbound = [
    links?.github ? (
      <OutboundIcon key="github" href={links.github} label="GitHub">
        <IconBrandGithub className="size-4" />
      </OutboundIcon>
    ) : null,
    links?.figma ? (
      <OutboundIcon key="figma" href={links.figma} label="Figma">
        <IconBrandFigma className="size-4" />
      </OutboundIcon>
    ) : null,
    links?.plugin ? (
      <OutboundIcon key="plugin" href={links.plugin} label="Plugin">
        <IconPuzzle className="size-4" />
      </OutboundIcon>
    ) : null,
  ].filter(Boolean)

  return (
    <div className="flex w-full min-w-0 items-center gap-1.5 md:w-auto md:gap-2">
      <InlineInstallBar className="min-w-0 flex-1 md:flex-none" packageName={packageName} isShadcn={isShadcn} />
      {outbound.length > 0 ? (
        <Group className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-background p-1 shadow-xs border border-border/40!">
          {outbound}
        </Group>
      ) : null}
    </div>
  )
}
