import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { Frame, FrameHeader } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { ToolAssetIcon } from '@/components/marketing/tools/tool-asset-icon'
import type { ResourceItem } from '@/config/menu-config'

export interface ToolCardProps {
  tool: ResourceItem
}

export function ToolCard({ tool }: ToolCardProps) {
  const isExternal = tool.href.startsWith('http')

  const badgeVariant =
    tool.release === 'new'
      ? 'success'
      : tool.release === 'updated'
        ? 'info'
        : tool.release === 'beta'
          ? 'secondary'
          : 'default'

  const badgeLabel =
    tool.release === 'new'
      ? 'New'
      : tool.release === 'updated'
        ? 'Updated'
        : tool.release === 'beta'
          ? 'Beta'
          : tool.release

  return (
    <Link
      href={tool.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer noopener' : undefined}
      className="group flex flex-col h-full outline-none"
      data-space-hover
      data-space-click="open"
    >
      <Frame className="flex flex-col h-full">
        <FrameHeader className="flex flex-row items-center justify-between px-3 py-1.5">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider">{tool.label ?? 'tool'}</span>
          {tool.release && (
            <Badge size="xs" variant={badgeVariant}>
              {badgeLabel}
            </Badge>
          )}
        </FrameHeader>

        <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden bg-background">
          <CardPanel className="flex-1 flex flex-col justify-between p-5 min-h-48">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="grid size-10 shrink-0 place-items-center squircle rounded-full text-foreground overflow-hidden"
                  style={{ backgroundColor: `${tool.color}50` }}
                >
                  <ToolAssetIcon label={tool.title || tool.label} size={32} />
                </div>
                <h4 className="text-base font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {tool.title}
                </h4>
              </div>

              <p className="text-xs leading-5 text-muted-foreground">{tool.description}</p>
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs font-medium text-foreground group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                {isExternal ? 'Open external lab' : 'Open studio'}
                <IconArrowRight className="size-3.5" />
              </span>
            </div>
          </CardPanel>
        </Card>
      </Frame>
    </Link>
  )
}
