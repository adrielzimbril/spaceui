'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { OrbBloop } from '@/registry/components/orb/bloop'
import { BloopState } from '@/registry/components/orb/bloop/types'
import { BENTO_CYCLE_INTERVAL } from '@/config/space-config'
import { useStaggeredInterval } from '@/hooks/use-staggered-interval'

const BLOOP_MODES: BloopState[] = [BloopState.idle, BloopState.listen, BloopState.think, BloopState.speak]

export function OrbBloopCard({ isVisible = true }: { isVisible?: boolean }) {
  const [bloopState, setBloopState] = React.useState<BloopState>(BloopState.idle)

  useStaggeredInterval(
    () => {
      setBloopState((prev) => {
        const nextIdx = (BLOOP_MODES.indexOf(prev) + 1) % BLOOP_MODES.length
        return BLOOP_MODES[nextIdx]
      })
    },
    BENTO_CYCLE_INTERVAL,
    isVisible,
  )

  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex min-h-72 flex-col items-center justify-center p-4 rounded-lg">
          {isVisible ? (
            <OrbBloop
              mode={bloopState}
              size={185}
              palette="candy"
              eyeSize={1.12}
              pupilSize={1.05}
              glow
              interactive
              trackPointer={false}
              interactiveSquish
              autoBlink
            />
          ) : (
            <div className="size-46 rounded-full bg-muted/60" />
          )}
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">Orb Bloop</FrameTitle>
        <Link
          href="/components/orb/bloop"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
