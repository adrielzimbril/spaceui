'use client'

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import NextImage from 'next/image'
import { PixelRevealImage } from '@/registry/components/spaceui/pixel-reveal-image'
import { Button } from '@/registry/primitives/button'
import { tickSound } from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'

export interface PixelRevealImageDemoProps {
  textureFile?: string
  accentColor?: string
  gridDensity?: number
  bandWidth?: number
  noiseIntensity?: number
  trigger?: 'loop' | 'hover' | 'scroll'
}

const PRESET_SAMPLES = [
  {
    id: 'sample-1',
    name: 'Twilight Ring',
    url: 'https://cdn.spaceui.one/atom/samples/image-1-f.png',
  },
  {
    id: 'sample-2',
    name: 'Monolith Horizon',
    url: 'https://cdn.spaceui.one/atom/samples/image-0-b.png',
  },
  {
    id: 'sample-3',
    name: 'Golden Shimmer',
    url: 'https://cdn.spaceui.one/atom/samples/image-9.png',
  },
  {
    id: 'sample-4',
    name: 'Forest Sanctum',
    url: 'https://cdn.spaceui.one/atom/samples/image-3.png',
  },
  {
    id: 'sample-5',
    name: 'Forest Sanctum (Back)',
    url: 'https://cdn.spaceui.one/atom/samples/image-3-b.png',
  },
]

export default function Demo({
  textureFile,
  accentColor = '#ffe9a8',
  gridDensity = 38,
  bandWidth = 3.5,
  noiseIntensity = 0.16,
  trigger = 'loop',
}: PixelRevealImageDemoProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(PRESET_SAMPLES[0].url)
  const [customFile, setCustomFile] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (textureFile) {
      setCustomFile(textureFile)
      setSelectedPreset(null)
    } else if (textureFile === '') {
      setCustomFile(null)
      setSelectedPreset(PRESET_SAMPLES[0].url)
    }
  }, [textureFile])

  const effectiveSrc = customFile || selectedPreset || PRESET_SAMPLES[0].url

  const reduced = useReducedMotion() ?? false
  const morphTransition = reduced ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center p-4 sm:p-8 gap-6',
        trigger === 'scroll' ? 'min-h-[160vh] py-[40vh]' : 'min-h-[520px]',
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={effectiveSrc}
          initial={reduced ? false : { scale: 0.98, opacity: 0, filter: 'blur(6px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={reduced ? { opacity: 0 } : { scale: 0.98, opacity: 0, filter: 'blur(6px)', pointerEvents: 'none' }}
          transition={morphTransition}
          className="w-full max-w-4xl lg:max-w-5xl overflow-hidden rounded-2xl will-change-[opacity,transform,filter]"
        >
          <PixelRevealImage
            key={`${effectiveSrc}-${accentColor}-${gridDensity}-${bandWidth}-${noiseIntensity}-${trigger}`}
            src={effectiveSrc}
            alt="Space UI Pixel Reveal Image"
            accentColor={accentColor}
            gridDensity={Number(gridDensity)}
            bandWidth={Number(bandWidth)}
            noiseIntensity={Number(noiseIntensity)}
            trigger={trigger}
            className="w-full h-full"
          />
        </motion.div>
      </AnimatePresence>

      {/* Preset thumbnail cards styled like Trajectory */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {PRESET_SAMPLES.map((sample) => {
          const isSelected = !customFile && effectiveSrc === sample.url
          return (
            <Button
              key={sample.id}
              type="button"
              variant="ghost"
              data-space-hover="tick"
              onClick={() => {
                tickSound()
                setCustomFile(null)
                setSelectedPreset(sample.url)
              }}
              className={cn(
                'group flex h-auto! flex-col items-center gap-1.5 rounded-xl bg-muted p-1.5 transition-all hover:bg-muted cursor-pointer shadow-none',
                isSelected && 'ring-2 ring-muted ring-offset-2 ring-offset-background',
              )}
            >
              <div className="relative aspect-video w-28 overflow-hidden rounded-lg bg-background">
                <NextImage
                  src={sample.url}
                  alt={sample.name}
                  width={112}
                  height={64}
                  className="size-full object-cover"
                />
              </div>
              <span
                className={cn(
                  'max-w-[112px] truncate px-1 text-[0.6875rem] font-medium transition-colors',
                  isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground group-hover:text-foreground',
                )}
              >
                {sample.name}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
