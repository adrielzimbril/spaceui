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
    const container = containerRef.current
    const canvas = surfaceRef.current
    if (!input || !canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = Math.max(Math.ceil(input.offsetWidth || container.offsetWidth || 300), 50)
    const height = Math.max(Math.ceil(input.offsetHeight || container.offsetHeight || 50), 30)
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)

    canvas.width = Math.ceil(width * dpr)
    canvas.height = Math.ceil(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!activeValue) {
      particlePoolRef.current = []
      return
    }

    const computed = getComputedStyle(input)
    const fontSize = parseFloat(computed.fontSize) || 24
    const paddingLeft = parseFloat(computed.paddingLeft) || 0
    const paddingTop = parseFloat(computed.paddingTop) || 0
    const paddingBottom = parseFloat(computed.paddingBottom) || 0

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.font = `${computed.fontWeight || '400'} ${fontSize}px ${computed.fontFamily}`

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
    if (computed.letterSpacing && computed.letterSpacing !== 'normal') {
      ctx.letterSpacing = computed.letterSpacing
    }

    const metrics = ctx.measureText(activeValue)
    const fontAscent = metrics.actualBoundingBoxAscent || fontSize * 0.8
    const fontDescent = metrics.actualBoundingBoxDescent || fontSize * 0.2
    const contentHeight = height - paddingTop - paddingBottom
    const baselineY = paddingTop + (contentHeight + fontAscent - fontDescent) / 2

    ctx.fillText(activeValue, paddingLeft, baselineY)
    ctx.restore()

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    const generated: ScatterParticle[] = []

    for (let py = 0; py < canvas.height; py++) {
      const rowOffset = py * canvas.width * 4
      for (let px = 0; px < canvas.width; px++) {
        const offset = rowOffset + px * 4
        const a = imageData[offset + 3]
        if (a > 24) {
          generated.push({
            x: px / dpr,
            y: py / dpr,
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

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => {
      if (!isAnimatingRef.current) {
        captureGlyphs()
      }
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [captureGlyphs])

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

        const canvas = surfaceRef.current
        const ctx = canvas?.getContext('2d')
        if (ctx && canvas) {
          const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)
          const clearOriginX = Math.max(0, wavefrontX * dpr)
          ctx.clearRect(clearOriginX, 0, canvas.width - clearOriginX, canvas.height)

          ctx.shadowBlur = 2
          for (let idx = 0; idx < surviving.length; idx++) {
            const pt = surviving[idx]
            if (pt.x > wavefrontX) {
              const fill = `${pt.color}${pt.alpha.toFixed(3)})`
              ctx.shadowColor = fill
              ctx.fillStyle = fill
              ctx.fillRect(pt.x * dpr, pt.y * dpr, pt.size * dpr, pt.size * dpr)
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
      className={cn('relative mx-auto w-full overflow-hidden text-3xl tracking-tight lg:text-5xl', className)}
      onSubmit={(e) => {
        e.preventDefault()
        triggerDissolve()
      }}
    >
      <canvas
        ref={surfaceRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-150',
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
