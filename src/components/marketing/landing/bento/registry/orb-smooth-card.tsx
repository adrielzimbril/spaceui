'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { OrbSmooth } from '@/registry/components/orb/smooth'
import { BENTO_CYCLE_INTERVAL } from '@/config/space-config'

const SMOOTH_STATES = [
  { id: 'pure', label: 'Pure Fluid · No Grain', speed: 3.2, watercolor: 0, timeScale: 1.1, grain: 0 },
  { id: 'watercolor-wash', label: 'Watercolor Wash', speed: 4.8, watercolor: 0.8, timeScale: 1.5, grain: 0 },
  { id: 'drift-grain', label: 'Soft Grain & Drift', speed: 2.8, watercolor: 0.25, timeScale: 1.0, grain: 0.45 },
  { id: 'glass', label: 'Glass Clear · No Grain', speed: 5.2, watercolor: 0.1, timeScale: 1.6, grain: 0 },
  { id: 'surge-pigment', label: 'Surge & Pigment', speed: 6.5, watercolor: 0.85, timeScale: 2.0, grain: 0.75 },
  { id: 'watercolor-pure', label: 'Watercolor Silk · No Grain', speed: 3.6, watercolor: 0.5, timeScale: 1.2, grain: 0 },
] as const

const SMOOTH_LUMINA_SEEDS = ['space-ui', 'atlas', 'aurora', 'orion', 'nova', 'sol', 'echo', 'iris'] as const

export function OrbSmoothCard({ isVisible = true }: { isVisible?: boolean }) {
  const [smoothStateIndex, setSmoothStateIndex] = React.useState(0)
  const [smoothSeedIndex, setSmoothSeedIndex] = React.useState(0)

  React.useEffect(() => {
    if (!isVisible) return
    const timer = setInterval(() => {
      setSmoothStateIndex((prev) => {
        const next = (prev + 1) % SMOOTH_STATES.length
        if (next === 0) {
          setSmoothSeedIndex((s) => (s + 1) % SMOOTH_LUMINA_SEEDS.length)
        }
        return next
      })
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [isVisible])

  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex min-h-72 flex-col items-center justify-center p-4 rounded-lg">
          <OrbSmooth
            key={SMOOTH_LUMINA_SEEDS[smoothSeedIndex]}
            size={190}
            textureUrl={`https://avatars.spaceui.one/v1?name=${SMOOTH_LUMINA_SEEDS[smoothSeedIndex]}&variant=lumina&format=svg`}
            audioMode="ambient"
            fbmSpeed={SMOOTH_STATES[smoothStateIndex].speed}
            watercolorStrength={SMOOTH_STATES[smoothStateIndex].watercolor}
            timeScale={SMOOTH_STATES[smoothStateIndex].timeScale}
            grainOpacity={SMOOTH_STATES[smoothStateIndex].grain}
            grainAnimated={SMOOTH_STATES[smoothStateIndex].grain > 0}
          />
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">Orb Smooth</FrameTitle>
        <Link
          href="/components/orb/smooth"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
