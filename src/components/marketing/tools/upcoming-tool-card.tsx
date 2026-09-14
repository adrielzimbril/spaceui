import * as React from 'react'
import { Frame, FrameHeader } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { cn } from '@/registry/lib/utils'
import { ToolAssetIcon } from '@/components/marketing/tools/tool-asset-icon'
import type { ResourceItem } from '@/config/menu-config'

export interface UpcomingToolCardProps {
  tool: ResourceItem
}

export function UpcomingToolCard({ tool }: UpcomingToolCardProps) {
  const badgeConfig = React.useMemo(() => {
    if (tool.release === 'beta') {
      return { label: 'Beta', ringColor: 'bg-purple-300', dotColor: 'bg-purple-400' }
    }
    if (tool.release === 'new') {
      return { label: 'New', ringColor: 'bg-green-300', dotColor: 'bg-green-400' }
    }
    if (tool.release === 'updated') {
      return { label: 'Updated', ringColor: 'bg-orange-300', dotColor: 'bg-orange-400' }
    }
    return { label: 'Coming Soon', ringColor: 'bg-amber-300', dotColor: 'bg-amber-400' }
  }, [tool.release])

  return (
    <Frame className="flex flex-col h-full">
      <FrameHeader className="flex flex-row items-center justify-end px-3 py-1.5">
        {/* <span className="text-xs font-semibold">{tool.title}</span> */}
        <Badge size="xs" variant="secondary" className="bg-background! text-foreground">
          <span className="relative flex justify-center items-center size-fit">
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping animation-duration-[2.25s]',
                badgeConfig.ringColor,
              )}
            />
            <span className={cn('relative inline-flex rounded-full size-2.5 animate-pulse', badgeConfig.dotColor)} />
          </span>
          {badgeConfig.label}
        </Badge>
      </FrameHeader>

      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden bg-background pointer-events-none">
        <CardPanel className="flex-1 flex flex-col justify-between p-3">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="grid size-10 shrink-0 place-items-center overflow-hidden">
                <ToolAssetIcon label={tool.title || tool.label} size={32} />
              </div>
              <h4 className="text-base font-semibold tracking-tight text-foreground">{tool.title}</h4>
            </div>

            <p className="text-xs leading-5 text-muted-foreground">{tool.description}</p>
          </div>
        </CardPanel>
      </Card>
    </Frame>
  )
}
