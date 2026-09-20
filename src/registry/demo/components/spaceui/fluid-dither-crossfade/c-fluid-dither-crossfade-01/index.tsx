'use client'

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import NextImage from 'next/image'
import { FluidDitherCrossfade } from '@/registry/components/spaceui/fluid-dither-crossfade'
import { Button } from '@/registry/primitives/button'
import { tickSound } from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'

export interface FluidDitherCrossfadeDemoProps {
  imageFront?: string
  imageBack?: string
  brushSize?: number
  pixelRes?: number
  pixelEdgeRes?: number
  ditherGrid?: number
  distortionStrength?: number
  inkDissipation?: number
  accentColor?: string
  revealStyle?: 'stagger' | 'blur' | 'pixelate'
}

const PRESET_PAIRS = [
  {
    id: 'pair-0',
    title: 'Monolith Horizon',
    imageA: 'https://cdn.spaceui.one/atom/samples/image-0-f.png',
    imageB: 'https://cdn.spaceui.one/atom/samples/image-0-b.png',
    nameA: 'Front',
    nameB: 'Back',
  },
  {
    id: 'pair-1',
    title: 'Twilight Ring',
    imageA: 'https://cdn.spaceui.one/atom/samples/image-1-f.png',
    imageB: 'https://cdn.spaceui.one/atom/samples/image-1-b.png',
    nameA: 'Front',
    nameB: 'Back',
  },
  {
    id: 'pair-2',
    title: 'Flora Portrait',
    imageA: 'https://cdn.spaceui.one/atom/samples/image-2-f.png',
    imageB: 'https://cdn.spaceui.one/atom/samples/image-2-b.png',
    nameA: 'Front',
    nameB: 'Back',
  },
  {
    id: 'pair-3',
    title: 'Forest Sanctum',
    imageA: 'https://cdn.spaceui.one/atom/samples/image-3-f.png',
    imageB: 'https://cdn.spaceui.one/atom/samples/image-3-b.png',
    nameA: 'Front',
    nameB: 'Back',
  },
]

export default function Demo({
  imageFront,
  imageBack,
  brushSize = 0.3,
  pixelRes = 150,
  pixelEdgeRes = 80,
  ditherGrid = 20,
  distortionStrength = 9.18,
  inkDissipation = 0.926,
  accentColor = '#ffe9a8',
  revealStyle = 'pixelate',
}: FluidDitherCrossfadeDemoProps) {
  const [selectedPair, setSelectedPair] = React.useState<{ a: string; b: string } | null>({
    a: PRESET_PAIRS[0].imageA,
    b: PRESET_PAIRS[0].imageB,
  })
  const [customFront, setCustomFront] = React.useState<string | null>(null)
  const [customBack, setCustomBack] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (imageFront) {
      setCustomFront(imageFront)
      setSelectedPair(null)
    } else if (imageFront === '') {
      setCustomFront(null)
    }
  }, [imageFront])

  React.useEffect(() => {
    if (imageBack) {
      setCustomBack(imageBack)
      setSelectedPair(null)
    } else if (imageBack === '') {
      setCustomBack(null)
    }
  }, [imageBack])

  const effectiveA = customFront || selectedPair?.a || PRESET_PAIRS[0].imageA
  const effectiveB = customBack || selectedPair?.b || PRESET_PAIRS[0].imageB

  const reduced = useReducedMotion() ?? false
  const morphTransition = reduced ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <div className="flex w-full flex-col items-center justify-center p-4 sm:p-8 gap-6 min-h-[520px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${effectiveA}-${effectiveB}`}
          initial={reduced ? false : { scale: 0.98, opacity: 0, filter: 'blur(6px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={reduced ? { opacity: 0 } : { scale: 0.98, opacity: 0, filter: 'blur(6px)', pointerEvents: 'none' }}
          transition={morphTransition}
          className="w-full max-w-4xl lg:max-w-5xl overflow-hidden rounded-2xl will-change-[opacity,transform,filter]"
        >
          <FluidDitherCrossfade
            key={`${effectiveA}-${effectiveB}-${brushSize}-${pixelRes}-${pixelEdgeRes}-${ditherGrid}-${distortionStrength}-${inkDissipation}-${accentColor}-${revealStyle}`}
            imageA={effectiveA}
            imageB={effectiveB}
            bgColor={accentColor}
            brushSize={Number(brushSize)}
            pixelRes={Number(pixelRes)}
            pixelEdgeRes={Number(pixelEdgeRes)}
            ditherGrid={Number(ditherGrid)}
            distortionStrength={Number(distortionStrength)}
            inkDissipation={Number(inkDissipation)}
            revealStyle={revealStyle}
            className="w-full"
          />
        </motion.div>
      </AnimatePresence>

      {/* Preset transition pair cards styled like Trajectory */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {PRESET_PAIRS.map((pair) => {
          const isSelected = !customFront && !customBack && effectiveA === pair.imageA && effectiveB === pair.imageB
          return (
            <Button
              key={pair.id}
              type="button"
              variant="ghost"
              data-space-hover="tick"
              onClick={() => {
                tickSound()
                setCustomFront(null)
                setCustomBack(null)
                setSelectedPair({ a: pair.imageA, b: pair.imageB })
              }}
              className={cn(
                'group flex h-auto! flex-col items-center gap-1.5 rounded-xl bg-muted p-1.5 transition-all hover:bg-muted cursor-pointer shadow-none',
                isSelected && 'ring-2 ring-muted ring-offset-2 ring-offset-background',
              )}
            >
              <div className="flex gap-0.5 overflow-hidden rounded-lg bg-background">
                <NextImage
                  src={pair.imageA}
                  alt={pair.nameA}
                  width={56}
                  height={64}
                  className="aspect-square w-14 object-cover"
                />
                <NextImage
                  src={pair.imageB}
                  alt={pair.nameB}
                  width={56}
                  height={64}
                  className="aspect-square w-14 object-cover"
                />
              </div>
              <span
                className={cn(
                  'max-w-28 truncate px-1 text-[0.6875rem] font-medium transition-colors',
                  isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground group-hover:text-foreground',
                )}
              >
                {pair.title}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
