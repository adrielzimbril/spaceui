'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { AssetFlag } from '@/tools/flags/asset-flag'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { tickSound } from '@/components/providers/sound-provider'
import { BENTO_CYCLE_INTERVAL } from '@/config/space-config'
import { useStaggeredInterval } from '@/hooks/use-staggered-interval'

const FLAG_SETS = [
  [
    { code: 'us', name: 'United States' },
    { code: 'jp', name: 'Japan' },
    { code: 'fr', name: 'France' },
    { code: 'ci', name: "Cote D'Ivoire" },
    { code: 'cn', name: 'China' },
    { code: 'br', name: 'Brazil' },
  ],
  [
    { code: 'ca', name: 'Canada' },
    { code: 'au', name: 'Australia' },
    { code: 'it', name: 'Italy' },
    { code: 'es', name: 'Spain' },
    { code: 'kr', name: 'South Korea' },
    { code: 'in', name: 'India' },
  ],
  [
    { code: 'ch', name: 'Switzerland' },
    { code: 'se', name: 'Sweden' },
    { code: 'nl', name: 'Netherlands' },
    { code: 'no', name: 'Norway' },
    { code: 'mx', name: 'Mexico' },
    { code: 'za', name: 'South Africa' },
  ],
  [
    { code: 'pt', name: 'Portugal' },
    { code: 'ar', name: 'Argentina' },
    { code: 'ie', name: 'Ireland' },
    { code: 'sg', name: 'Singapore' },
    { code: 'eg', name: 'Egypt' },
    { code: 'nz', name: 'New Zealand' },
  ],
]

interface FlagsCardProps {
  isVisible?: boolean
}

export function FlagsCard({ isVisible = true }: FlagsCardProps) {
  const [flagSetIndex, setFlagSetIndex] = React.useState(0)

  useStaggeredInterval(() => {
    setFlagSetIndex((prev) => (prev + 1) % FLAG_SETS.length)
  }, BENTO_CYCLE_INTERVAL, isVisible)

  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex flex-col justify-center gap-3 p-3.5 min-h-44 rounded-lg">
          <div className="grid grid-cols-3 gap-2.5 items-center justify-items-center">
            {FLAG_SETS[flagSetIndex].map((f, slotIdx) => (
              <div
                key={`flag-slot-${slotIdx}`}
                onClick={() => {
                  tickSound()
                  setFlagSetIndex((prev) => (prev + 1) % FLAG_SETS.length)
                }}
                className="flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-110 select-none"
              >
                <div className="rounded-full overflow-hidden p-0.5">
                  <MorphIcon activeKey={f.code} variant="blur-scale" duration={0.32}>
                    <AssetFlag code={f.code} shape="circle" size={28} alt={f.name} className="ring-0" />
                  </MorphIcon>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{f.code}</span>
              </div>
            ))}
          </div>
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">SVG Flags</FrameTitle>
        <Link
          href="/tools/flags"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
