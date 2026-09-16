'use client'

import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { MorphingText } from '@/registry/components/spaceui/morphing-text'

const MORPH_WORDS = ['Space UI', 'Gooey UI', 'Juicy UI', 'Pretty UI', 'Snappy UI', 'Better UI']

export function MorphingTextCard() {
  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex min-h-72 flex-col items-center justify-center p-4 rounded-lg">
          <MorphingText
            texts={MORPH_WORDS}
            interval={2400}
            pauseOnHover
            textClassName="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground"
          />
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">Morphing Text</FrameTitle>
        <Link
          href="/components/morphing-text"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
