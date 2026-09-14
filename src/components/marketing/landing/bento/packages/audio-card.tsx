'use client'

import * as React from 'react'
import { IconArrowUpRight, IconPlayerPlayFilled } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/primitives/button'
import { bloom, chime, droplet, sparkle, tap, tick } from '@usespaceui/sounds'

const SOUND_DEMOS = [
  { label: 'Bloom', fn: bloom, desc: 'Harmonic' },
  { label: 'Chime', fn: chime, desc: 'Bell' },
  { label: 'Sparkle', fn: sparkle, desc: 'Reward' },
  { label: 'Droplet', fn: droplet, desc: 'Liquid pop' },
  { label: 'Tap', fn: tap, desc: 'Button' },
  { label: 'Tick', fn: tick, desc: 'Click' },
]

export function AudioCard() {
  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full">
        <CardPanel className="flex-1 flex flex-col justify-center p-3 min-h-44">
          <div className="grid grid-cols-2 gap-1.5">
            {SOUND_DEMOS.map((s) => (
              <Button
                key={s.label}
                variant="ghost"
                size="sm"
                onClick={() => s.fn()}
                className="h-auto! justify-start gap-1.5 rounded-lg bg-muted/60 p-2 text-left transition-colors hover:bg-muted active:scale-95 cursor-pointer"
              >
                <IconPlayerPlayFilled className="size-2.5 text-foreground shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">{s.label}</span>
              </Button>
            ))}
          </div>
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle>Procedural Audio</FrameTitle>
        <a
          href="https://sounds.spaceui.one"
          target="_blank"
          rel="noreferrer"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </a>
      </FrameFooter>
    </Frame>
  )
}
