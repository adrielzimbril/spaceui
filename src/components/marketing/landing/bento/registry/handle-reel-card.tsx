'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { HandleReel } from '@/registry/components/spaceui/handle-reel'

const BENTO_HANDLE_REEL_NAMES = [
  'showcase',
  'primitives',
  'blocks',
  'templates',
  'animations',
  'canvas',
  'shaders',
  'craft',
]

function BentoHandleReel() {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden py-4 text-foreground select-none">
      <HandleReel
        prefix="spaceui.one/"
        finalName="components"
        names={BENTO_HANDLE_REEL_NAMES}
        highlightColor="#f43f5e"
        spinDuration={4.2}
        loop
        loopDelay={2500}
        editable
        rows={5}
        className="px-2"
        textClassName="text-xl sm:text-2xl font-medium tracking-tight"
      />
    </div>
  )
}

export function HandleReelCard() {
  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex min-h-72 flex-col justify-center p-3 sm:p-4 rounded-lg">
          <div className="w-full max-w-sm mx-auto">
            <BentoHandleReel />
          </div>
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle>Handle Reel</FrameTitle>
        <Link
          href="/components/handle-reel"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
