'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { IconArrowUpRight, IconArrowsShuffle } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { tickSound } from '@/components/providers/sound-provider'
import { imagelib } from '@/lib/imagelib'
import { BENTO_CYCLE_INTERVAL, USER_INTERACTION_DEBOUNCE } from '@/config/space-config'
import { cn } from '@/registry/lib/utils'
import { useStaggeredInterval } from '@/hooks/use-staggered-interval'

const DEFAULT_COLS_SEQUENCE = [3, 2, 4, 2, 4]

const SPLIT_SAMPLES: Array<{
  id: string
  url: string
  title: string
  defaultCols: number
}> = imagelib.tools.imagesplit.map((sample, idx) => ({
  id: sample.id,
  url: sample.url,
  title: sample.name,
  defaultCols: DEFAULT_COLS_SEQUENCE[idx % DEFAULT_COLS_SEQUENCE.length],
}))

interface ImageSplitCardProps {
  isVisible?: boolean
}

export function ImageSplitCard({ isVisible = true }: ImageSplitCardProps) {
  const [splitCols, setSplitCols] = React.useState<number>(SPLIT_SAMPLES[0].defaultCols)
  const [splitSampleIdx, setSplitSampleIdx] = React.useState(0)
  const lastSplitInteractionRef = React.useRef<number>(Date.now())

  const cycleSplitSample = React.useCallback(() => {
    lastSplitInteractionRef.current = Date.now()
    tickSound()
    setSplitSampleIdx((prev) => {
      const next = (prev + 1) % SPLIT_SAMPLES.length
      setSplitCols(SPLIT_SAMPLES[next].defaultCols)
      return next
    })
  }, [])

  useStaggeredInterval(() => {
    if (Date.now() - lastSplitInteractionRef.current < USER_INTERACTION_DEBOUNCE) {
      return
    }
    setSplitSampleIdx((prev) => {
      const next = (prev + 1) % SPLIT_SAMPLES.length
      setSplitCols(SPLIT_SAMPLES[next].defaultCols)
      return next
    })
  }, BENTO_CYCLE_INTERVAL, isVisible)

  return (
    <Frame className="flex flex-col h-full sm:col-span-2 lg:col-span-2">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex flex-col items-center justify-center gap-3 p-4 min-h-48 rounded-lg">
          <div
            onClick={cycleSplitSample}
            title="Click to switch image"
            className="relative w-full max-w-68 aspect-16/10 overflow-hidden rounded-xl border-2 border-muted bg-muted/20 cursor-pointer"
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={splitSampleIdx}
                initial={{ scale: 0.98, opacity: 0, filter: 'blur(3px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                exit={{ scale: 0.98, opacity: 0, filter: 'blur(3px)', pointerEvents: 'none' }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 grid h-full w-full will-change-[opacity,transform,filter]"
                style={{
                  gridTemplateColumns: `repeat(${splitCols}, 1fr)`,
                  gap: '2px',
                }}
              >
                {Array.from({ length: splitCols }).map((_, i) => (
                  <div key={i} className="relative h-full w-full overflow-hidden bg-muted/30">
                    <Image
                      src={SPLIT_SAMPLES[splitSampleIdx].url}
                      alt={`Slice ${i + 1}`}
                      width={480}
                      height={300}
                      className="absolute top-0 h-full max-w-none object-cover pointer-events-none select-none transition-all duration-300"
                      style={{
                        width: `${splitCols * 100}%`,
                        left: `-${i * 100}%`,
                      }}
                    />
                    {i < splitCols - 1 && (
                      <div className="absolute right-0 top-0 bottom-0 w-px border-r border-dashed border-foreground/30 z-10" />
                    )}
                    <span className="pointer-events-none absolute left-1 top-1 rounded-md bg-background/85 backdrop-blur-xs border-2 border-muted px-1 py-0.5 text-[8px] font-semibold text-foreground z-10">
                      0{i + 1}
                    </span>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1.5">
            {([2, 3, 4] as const).map((cols) => {
              const isSelected = splitCols === cols
              return (
                <Button
                  key={cols}
                  variant={isSelected ? 'default' : 'secondary'}
                  size="xs"
                  onClick={() => {
                    lastSplitInteractionRef.current = Date.now()
                    tickSound()
                    setSplitCols(cols)
                  }}
                  className={cn('border-none cursor-pointer transition-none', isSelected && 'font-medium')}
                >
                  {cols} Columns
                </Button>
              )
            })}
          </div>
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">Image Split</FrameTitle>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon-xs"
            onClick={cycleSplitSample}
            data-space-hover
            title="Randomize split image"
            className="rounded-full cursor-pointer"
          >
            <IconArrowsShuffle className="size-3.5" />
          </Button>
          <Link
            href="/tools/imagesplit"
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
