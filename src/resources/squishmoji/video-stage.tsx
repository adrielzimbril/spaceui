'use client'

import type { ReactNode, RefObject } from 'react'
import { IconRefresh } from '@tabler/icons-react'
import { bloomSound } from '@/components/providers/sound-provider'
import { Button } from '@/registry/primitives/button'
import { Input } from '@/registry/primitives/input'
import type { VideoAspect } from '@/resources/components/shared/avatar/export/dims'
import { cn } from '@/registry/lib/utils'
import { useMediaQuery } from '@/registry/hooks/browser/use-media-query'

export function VideoStage({
  stageRef,
  preview,
  seed = '',
  setSeed,
  placeholder = '',
  onRandomize,
  aspect = '1:1',
}: {
  stageRef: RefObject<HTMLDivElement | null>
  preview: ReactNode
  seed?: string
  setSeed: (value: string) => void
  placeholder?: string
  onRandomize: () => void
  aspect?: VideoAspect
}) {
  const isMobile = useMediaQuery('(max-width: 768px)', true)
  const [aw, ah] = (aspect ?? '1:1').split(':').map(Number)
  const width = aw || 1
  const height = ah || 1

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="@container flex min-h-0 flex-1 items-center justify-center p-3 md:p-8">
        <div
          ref={stageRef}
          className={cn(
            'relative overflow-hidden rounded-2xl bg-muted h-full w-auto',
            isMobile && 'h-auto w-full max-h-[75%] max-w-[75%]',
          )}
          style={{
            aspectRatio: `${width} / ${height}`,
            // width: `min(100%, calc(100cqh * ${width} / ${height}))`,
            // height: `min(100%, calc(100cqw * ${height} / ${width}))`,
          }}
        >
          <div className="absolute inset-0 grid place-items-center p-[7%]">
            {/* use cn because if height superior or d=to 15 h becaume auto and non full */}
            <div
              className={cn(
                'aspect-square h-full w-auto max-w-auto',
                isMobile && 'w-min',
                height >= 10 && 'h-auto w-full',
              )}
            >
              {preview}
            </div>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 px-4 pb-3 text-sm tracking-tight text-muted-foreground md:pb-6 md:text-lg">
        <span>Let&apos;s find your squishmoji</span>
        <Input
          unstyled
          value={seed}
          onChange={(event) => setSeed(event.target.value)}
          aria-label="Seed"
          placeholder={placeholder}
          className="w-auto min-w-28 max-w-40 border-0 border-b border-foreground/50 bg-transparent px-0 pb-0.5 text-sm font-medium text-foreground shadow-none outline-none placeholder:text-muted-foreground/50 focus:border-b-foreground focus-within:ring-0! focus-visible:ring-0! md:min-w-36 md:max-w-48 md:text-lg [&_input]:h-auto [&_input]:border-none [&_input]:p-0! [&_input]:outline-none [&_input]:ring-0!"
        />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Randomize seed"
          onClick={() => {
            bloomSound()
            onRandomize()
          }}
        >
          <IconRefresh />
        </Button>
      </div>
    </div>
  )
}
