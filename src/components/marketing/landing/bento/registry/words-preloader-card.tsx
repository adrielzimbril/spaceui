'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight, IconRotateClockwise } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/primitives/button'
import { WordsPreloader } from '@/registry/components/spaceui/words-preloader'
import { tickSound } from '@/components/providers/sound-provider'
import { BENTO_CYCLE_INTERVAL } from '@/config/space-config'
import { useStaggeredInterval } from '@/hooks/use-staggered-interval'

export function WordsPreloaderCard({ isVisible = true }: { isVisible?: boolean }) {
  const [preloaderKey, setPreloaderKey] = React.useState(0)

  useStaggeredInterval(() => {
    setPreloaderKey((prev) => prev + 1)
  }, BENTO_CYCLE_INTERVAL, isVisible)

  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex min-h-72 p-0 overflow-hidden relative rounded-lg">
          <div className="relative w-full h-full min-h-72 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-muted/10">
            <WordsPreloader
              key={preloaderKey}
              words={['Hello', 'Bonjour', 'Ciao', 'Space UI']}
              duration={1800}
              className="h-full min-h-72 w-full"
            >
              <motion.div
                initial={{ scale: 0.98, opacity: 0, filter: 'blur(4px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex size-full items-center justify-center p-6 will-change-[opacity,transform,filter]"
              >
                <div className="relative flex w-full max-w-[220px] flex-col gap-3 rounded-2xl bg-card p-4">
                  <div className="h-4 w-28 rounded-lg bg-foreground/10" />
                  <div className="space-y-2">
                    <div className="h-2.5 w-full rounded-md bg-foreground/5" />
                    <div className="h-2.5 w-4/5 rounded-md bg-foreground/5" />
                    <div className="h-2.5 w-3/5 rounded-md bg-foreground/5" />
                  </div>
                  <div className="mt-1 flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="h-3 w-12 rounded bg-foreground/10" />
                    <div className="h-6 w-16 rounded-lg bg-primary/20" />
                  </div>
                </div>
              </motion.div>
            </WordsPreloader>
          </div>
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">Words Preloader</FrameTitle>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon-xs"
            onClick={() => {
              tickSound()
              setPreloaderKey((prev) => prev + 1)
            }}
            data-space-hover
            title="Replay animation"
            className="rounded-full cursor-pointer"
          >
            <IconRotateClockwise className="size-3.5" />
          </Button>
          <Link
            href="/components/spaceui/words-preloader"
            data-space-hover
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowUpRight className="size-4" />
          </Link>
        </div>
      </FrameFooter>
    </Frame>
  )
}
