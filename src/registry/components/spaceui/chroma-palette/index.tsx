'use client'

import * as React from 'react'
import { IconRotateClockwise, IconCopy, IconCheck } from '@tabler/icons-react'
import { NICE_PALETTES } from '@usespaceui/gradients'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { cn } from '@/registry/lib/utils'

export type ChromaPaletteProps = {
  count?: number
  corner?: number
  morph?: number
  palettes?: string[][]
  onGenerate?: () => string[]
  onPaletteChange?: (colors: string[]) => void
  className?: string
}

const TOTAL_BAR_WIDTH_REM = 14 // 224px
const BAR_HEIGHT_REM = 3.625 // 58px
const GAP_REM = 0.25 // 4px
const SLAB_PADDING_REM = 0.625 // 10px
const BUTTON_WIDTH_REM = 2.125 // 34px
const DEFAULT_CORNER_REM = 0.875 // 14px

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))
const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

const hp = (e: number) => {
  const t = e - 1
  return 1 + 2.7 * t ** 3 + 1.7 * t ** 2
}

const gp = (e: number) => (e <= 0 ? 0 : e < 0.4 ? 1 - (1 - e / 0.4) ** 3 : 1 - hp((e - 0.4) / 0.6))
const durationFactor = (e: number) => 1.6 - (e / 100) * 1.2

function getRandomPalette(count: number): string[] {
  const item = NICE_PALETTES[Math.floor(Math.random() * NICE_PALETTES.length)]
  return item ? item.colors.slice(0, count) : ['#3aa0ff', '#7cf0c4', '#ff8f6b', '#ffd76b', '#6b4bff'].slice(0, count)
}

export function ChromaPalette({
  count: propCount = 5,
  corner = 14,
  morph = 50,
  palettes,
  onGenerate,
  onPaletteChange,
  className,
}: ChromaPaletteProps) {
  const count = clamp(Math.round(propCount), 2, 5)
  const paletteIndexRef = React.useRef(0)

  const getNextColors = React.useCallback((): string[] => {
    if (onGenerate) {
      const generated = onGenerate()
      return generated.slice(0, count)
    }
    if (palettes && palettes.length > 0) {
      const p = palettes[paletteIndexRef.current % palettes.length]
      paletteIndexRef.current += 1
      return p.slice(0, count)
    }
    return getRandomPalette(count)
  }, [count, onGenerate, palettes])

  const [colors, setColors] = React.useState<string[]>(() => getNextColors())
  const [nextColors, setNextColors] = React.useState<string[] | null>(null)
  const [morphProgress, setMorphProgress] = React.useState<number>(0)
  const [rotation, setRotation] = React.useState<number>(0)
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null)
  const [hoveredSwatch, setHoveredSwatch] = React.useState<number | null>(null)

  const animFrameRef = React.useRef<number>(0)
  const filterId = React.useId().replace(/:/g, '')

  // Re-synchronize palette length if count prop changes
  React.useEffect(() => {
    if (colors.length !== count) {
      const next = getNextColors()
      setColors(next)
      setNextColors(null)
      onPaletteChange?.(next)
    }
  }, [count, colors.length, getNextColors, onPaletteChange])

  // Clean up RAF on unmount
  React.useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  const handleGenerate = () => {
    if (animFrameRef.current) return

    setRotation((prev) => prev + 1)
    const newColors = getNextColors()

    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setColors(newColors)
      onPaletteChange?.(newColors)
      return
    }

    setNextColors(newColors)
    const animDuration = 760 * durationFactor(clamp(morph, 0, 100))
    const startTime = performance.now()

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / animDuration)
      setMorphProgress(progress)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        animFrameRef.current = 0
        setColors(newColors)
        setNextColors(null)
        setMorphProgress(0)
        onPaletteChange?.(newColors)
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
  }

  const copyToClipboard = (hex: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(hex)
    }
    setCopiedColor(hex)
    setTimeout(() => setCopiedColor(null), 1500)
  }

  const cornerRem = corner / 16 || DEFAULT_CORNER_REM
  const clampedCornerRem = clamp(cornerRem, 0, BAR_HEIGHT_REM / 2)
  const slabRadiusRem = clampedCornerRem + SLAB_PADDING_REM * Math.min(1, clampedCornerRem / DEFAULT_CORNER_REM)

  const segmentWidthRem = (TOTAL_BAR_WIDTH_REM - GAP_REM * (count - 1)) / count
  const stepRem = segmentWidthRem + GAP_REM

  const normProgress = clamp(morphProgress, 0, 1)
  const currentMorphFactor = Math.max(0, gp(normProgress))
  const slabScale = 1 - 0.035 * currentMorphFactor
  const blurDeviation = Math.sin(Math.PI * normProgress) * 5

  const isMorphing = morphProgress > 0 && morphProgress < 1

  return (
    <div className={cn('relative inline-flex items-center gap-[0.375rem] select-none font-sans', className)}>
      {/* SVG Gooey Filter definition */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurDeviation} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -13"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Palette Swatches Slab */}
      <div
        style={{
          borderRadius: `${slabRadiusRem}rem`,
          transform: `scale(${slabScale})`,
        }}
        className="p-[0.625rem] bg-muted transition-transform duration-100 ease-out"
      >
        <div
          style={{
            width: `${TOTAL_BAR_WIDTH_REM}rem`,
            height: `${BAR_HEIGHT_REM}rem`,
          }}
          className="relative"
        >
          <div style={{ filter: `url(#${filterId})` }} className="absolute inset-0 w-full h-full" aria-hidden="false">
            {colors.map((hex, idx) => {
              const activeHex = nextColors && normProgress >= 0.4 ? nextColors[idx] : hex
              const w = lerp(segmentWidthRem, BAR_HEIGHT_REM * 0.66, currentMorphFactor)
              const h = lerp(BAR_HEIGHT_REM, BAR_HEIGHT_REM * 0.66, currentMorphFactor)
              const top = (BAR_HEIGHT_REM - h) / 2
              const left = idx * stepRem + (segmentWidthRem - w) / 2
              const radius = lerp(clampedCornerRem, h / 2, currentMorphFactor)

              const isHovered = hoveredSwatch === idx
              const isCopied = copiedColor === activeHex
              const iconKey = isCopied ? 'check' : isHovered ? 'copy' : 'empty'

              return (
                <button
                  key={`${idx}-${hex}`}
                  type="button"
                  onClick={() => copyToClipboard(activeHex)}
                  onPointerEnter={() => setHoveredSwatch(idx)}
                  onPointerLeave={() => setHoveredSwatch((curr) => (curr === idx ? null : curr))}
                  title={`Copy ${activeHex}`}
                  disabled={isMorphing}
                  style={{
                    backgroundColor: activeHex,
                    width: `${w}rem`,
                    height: `${h}rem`,
                    top: `${top}rem`,
                    left: `${left}rem`,
                    borderRadius: `${radius}rem`,
                  }}
                  className="absolute group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className={cn(
                      'absolute inset-0 flex items-center justify-center transition-all duration-200 rounded-[inherit]',
                      isCopied
                        ? 'bg-black/30 text-white'
                        : isHovered
                          ? 'bg-black/20 text-white'
                          : 'bg-transparent text-transparent',
                    )}
                  >
                    <MorphIcon activeKey={iconKey} variant="spring" duration={0.2}>
                      {isCopied ? (
                        <IconCheck className="size-[0.875rem]" strokeWidth={3} />
                      ) : isHovered ? (
                        <IconCopy className="size-[0.8125rem]" strokeWidth={2.4} />
                      ) : null}
                    </MorphIcon>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Re-generate Action Button */}
      <div
        style={{ borderRadius: `${slabRadiusRem}rem` }}
        className="p-[0.625rem] bg-muted inline-flex items-center justify-center"
      >
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isMorphing}
          aria-label="Generate a new palette"
          style={{
            width: `${BUTTON_WIDTH_REM}rem`,
            height: `${BAR_HEIGHT_REM}rem`,
            borderRadius: `${clampedCornerRem}rem`,
          }}
          className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          <IconRotateClockwise
            className="size-[1.125rem] transition-transform duration-500 ease-out"
            strokeWidth={2.2}
            style={{
              transform: `rotate(${rotation * 180}deg)`,
            }}
          />
        </button>
      </div>
    </div>
  )
}
