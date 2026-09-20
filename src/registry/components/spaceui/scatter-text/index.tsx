'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'

export interface ScatterTextProps {
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit?: (value: string) => void
  className?: string
  inputClassName?: string
}

interface ScatterParticle {
  x: number
  y: number
  size: number
  alpha: number
  vx: number
  vy: number
  color: string
}

const CANVAS_DIMENSION = 800

export function ScatterText({
  placeholder,
  value: controlledValue,
  defaultValue = '',
  onChange,
  onSubmit,
  className,
  inputClassName,
}: ScatterTextProps) {
  const containerRef = React.useRef<HTMLFormElement>(null)
  const surfaceRef = React.useRef<HTMLCanvasElement>(null)
  const fieldRef = React.useRef<HTMLInputElement>(null)
  const particlePoolRef = React.useRef<ScatterParticle[]>([])
  const isAnimatingRef = React.useRef(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [isDissolving, setIsDissolving] = React.useState(false)

  const activeValue = controlledValue ?? internalValue

  const captureGlyphs = React.useCallback(() => {
    const input = fieldRef.current
    const canvas = surfaceRef.current
    if (!input || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = CANVAS_DIMENSION
    canvas.height = CANVAS_DIMENSION
    ctx.clearRect(0, 0, CANVAS_DIMENSION, CANVAS_DIMENSION)

    if (!activeValue) {
      particlePoolRef.current = []
      return
    }

    const computed = getComputedStyle(input)
    const fontSize = parseFloat(computed.fontSize) || 36
    ctx.font = `${2 * fontSize}px ${computed.fontFamily}`

    // Safely extract theme/element text color
    let glyphColor = computed.color
    if (!glyphColor || glyphColor === 'transparent' || glyphColor === 'rgba(0, 0, 0, 0)') {
      glyphColor = containerRef.current ? getComputedStyle(containerRef.current).color : ''
    }
    if (!glyphColor || glyphColor === 'transparent' || glyphColor === 'rgba(0, 0, 0, 0)') {
      const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      glyphColor = isDarkMode ? '#ffffff' : '#09090b'
    }

    ctx.fillStyle = glyphColor
    ctx.letterSpacing = computed.letterSpacing !== 'normal' ? computed.letterSpacing : '-0.05em'

    const metrics = ctx.measureText(activeValue)
    const fontAscent = metrics.actualBoundingBoxAscent || fontSize
    const fontDescent = metrics.actualBoundingBoxDescent || 0
    const baselineY = fontAscent + fontDescent + 10
    ctx.fillText(activeValue, 0, baselineY)

    const imageData = ctx.getImageData(0, 0, CANVAS_DIMENSION, CANVAS_DIMENSION).data
    const generated: ScatterParticle[] = []

    for (let py = 0; py < CANVAS_DIMENSION; py++) {
      const rowOffset = py * CANVAS_DIMENSION * 4
      for (let px = 0; px < CANVAS_DIMENSION; px++) {
        const offset = rowOffset + px * 4
        const a = imageData[offset + 3]
        if (a > 24) {
          generated.push({
            x: px,
            y: py,
            size: 1.2,
            alpha: a / 255,
            vx: (Math.random() - 0.5) * 1.8,
            vy: (Math.random() - 0.5) * 1.8,
            color: `rgba(${imageData[offset]},${imageData[offset + 1]},${imageData[offset + 2]},`,
          })
        }
      }
    }
    particlePoolRef.current = generated
  }, [activeValue])

  React.useEffect(() => {
    if (!isAnimatingRef.current) {
      captureGlyphs()
    }
  }, [activeValue, captureGlyphs])

  const triggerDissolve = React.useCallback(() => {
    if (isAnimatingRef.current || !activeValue) return
    isAnimatingRef.current = true

    captureGlyphs()
    setIsDissolving(true)

    const rightBound = particlePoolRef.current.reduce((max, pt) => (pt.x > max ? pt.x : max), 0)

    const runDisintegrationStep = (wavefrontX: number) => {
      requestAnimationFrame(() => {
        const surviving: ScatterParticle[] = []
        const pool = particlePoolRef.current

        for (let idx = 0; idx < pool.length; idx++) {
          const pt = pool[idx]
          if (pt.x < wavefrontX) {
            surviving.push(pt)
          } else {
            if (pt.size <= 0.05 || pt.alpha <= 0.02) continue
            pt.x += pt.vx
            pt.y += pt.vy
            pt.size = Math.max(0, pt.size - 0.045 * (0.6 + Math.random() * 0.8))
            pt.alpha = Math.max(0, pt.alpha - 0.04 * (0.6 + Math.random() * 0.8))
            surviving.push(pt)
          }
        }
        particlePoolRef.current = surviving

        const ctx = surfaceRef.current?.getContext('2d')
        if (ctx) {
          const clearOriginX = Math.max(0, wavefrontX)
          ctx.clearRect(clearOriginX, 0, CANVAS_DIMENSION - clearOriginX, CANVAS_DIMENSION)

          ctx.shadowBlur = 2
          for (let idx = 0; idx < surviving.length; idx++) {
            const pt = surviving[idx]
            if (pt.x > wavefrontX) {
              const fill = `${pt.color}${pt.alpha.toFixed(3)})`
              ctx.shadowColor = fill
              ctx.fillStyle = fill
              ctx.fillRect(pt.x, pt.y, pt.size, pt.size)
            }
          }
        }

        if (surviving.length > 0) {
          runDisintegrationStep(wavefrontX - 8)
        } else {
          setInternalValue('')
          setIsDissolving(false)
          isAnimatingRef.current = false
          onSubmit?.(activeValue)
        }
      })
    }

    runDisintegrationStep(rightBound)
  }, [activeValue, captureGlyphs, onSubmit])

  return (
    <form
      ref={containerRef}
      className={cn('relative mx-auto w-full text-3xl tracking-tight lg:text-5xl', className)}
      onSubmit={(e) => {
        e.preventDefault()
        triggerDissolve()
      }}
    >
      <canvas
        ref={surfaceRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-[10%] left-0 origin-top-left scale-50 transition-opacity duration-150 lg:top-[12%]',
          isDissolving ? 'opacity-100 blur-[2px]' : 'opacity-0 blur-0',
        )}
      />
      <label className="flex items-center">
        <input
          ref={fieldRef}
          value={activeValue}
          placeholder={placeholder}
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          onChange={(e) => {
            if (isDissolving) return
            if (controlledValue === undefined) setInternalValue(e.target.value)
            onChange?.(e)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              triggerDissolve()
            }
          }}
          className={cn(
            'relative z-10 h-full w-full border-none bg-transparent pr-3 text-foreground outline-none focus:ring-0',
            isDissolving && 'text-transparent',
            inputClassName,
          )}
        />
        <button
          type="submit"
          className="relative z-10 flex h-full shrink-0 cursor-pointer items-center justify-center whitespace-nowrap pl-2 text-foreground"
        >
          {activeValue ? (
            <span className="pt-2 text-base tracking-tight opacity-50">[&nbsp;enter&nbsp;↵&nbsp;]</span>
          ) : (
            '→'
          )}
        </button>
      </label>
    </form>
  )
}
