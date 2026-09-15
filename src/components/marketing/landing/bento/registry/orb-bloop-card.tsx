'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { OrbBloop } from '@/registry/components/orb/bloop'
import { BloopState } from '@/registry/components/orb/bloop/types'
import { BENTO_CYCLE_INTERVAL } from '@/config/space-config'

export function OrbBloopCard({ isVisible = true }: { isVisible?: boolean }) {
  const [bloopState, setBloopState] = React.useState<BloopState>(BloopState.idle)

  React.useEffect(() => {
    if (!isVisible) return
    const modes: BloopState[] = [BloopState.idle, BloopState.listen, BloopState.think, BloopState.speak]
    const timer = setInterval(() => {
      setBloopState((prev) => {
        const nextIdx = (modes.indexOf(prev) + 1) % modes.length
        return modes[nextIdx]
      })
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [isVisible])

  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex min-h-72 flex-col items-center justify-center p-4 rounded-lg">
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
