'use client'

import * as React from 'react'
import gsap from 'gsap'
import { motion } from 'motion/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/registry/lib/utils'
import { SilkBorder, type SilkPreset } from '@/registry/components/spaceui/silk-border'
import { LiquidBorder, type LiquidPreset } from '@/registry/components/spaceui/liquid-metal-border'

export const pixelButtonVariants = cva(
  'group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer hover:scale-105',
  {
    variants: {
      variant: {
        default: 'border-2 border-border bg-background text-foreground',
        primary: 'border-2 border-primary bg-primary text-primary-foreground',
        outline: 'border-2 border-input bg-transparent text-foreground',
        secondary: 'border-2 border-secondary bg-secondary text-secondary-foreground',
        destructive: 'border-2 border-destructive bg-destructive text-white',
        ghost: 'border-2 border-transparent hover:bg-accent text-foreground',
      },
      size: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-2 py-2 h-auto text-xs',
        default: 'px-4 py-2 text-sm',
        lg: 'px-4 py-2 text-lg',
      },
      squircle: {
        true: 'squircle rounded-7xl',
        false: 'rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      squircle: true,
    },
  },
)

export type PixelButtonBorderEffect = 'default' | 'silk' | 'metal' | 'none'

export interface PixelFillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof pixelButtonVariants> {
  children?: React.ReactNode
  pixelColor?: string
  textColorOnHover?: string
  pixelSize?: number
  blurAmount?: string
  href?: string
  target?: string
  rel?: string
  borderEffect?: PixelButtonBorderEffect
  borderVariant?: PixelButtonBorderEffect
  silkPreset?: SilkPreset
  metalPreset?: LiquidPreset
  borderClassName?: string
}

interface PixelCoord {
  x: number
  y: number
  distance: number
}

export const PixelFillButton = React.forwardRef<HTMLButtonElement, PixelFillButtonProps>(
  (
    {
      children,
      className,
      variant,
      size,
      squircle = true,
      pixelColor = '#ffe9a8',
      textColorOnHover = '#000000',
      pixelSize = 4,
      blurAmount = '8px',
      href,
      target,
      rel,
      borderEffect,
      borderVariant,
      silkPreset = 'twilight',
      metalPreset = 'chrome',
      borderClassName,
      ...props
    },
    forwardedRef,
  ) => {
    const internalButtonRef = React.useRef<HTMLElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const [isHovered, setIsHovered] = React.useState(false)

    const gridRef = React.useRef<PixelCoord[]>([])
    const progressRef = React.useRef({ count: 0 })
    const tweenRef = React.useRef<gsap.core.Tween | null>(null)

    const syncCanvasSize = React.useCallback(() => {
      const btn = internalButtonRef.current
      const canvas = canvasRef.current
      if (!btn || !canvas) return
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)
      const nextWidth = btn.offsetWidth * dpr
      const nextHeight = btn.offsetHeight * dpr
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth
        canvas.height = nextHeight
      }
    }, [])

    React.useEffect(() => {
      const btn = internalButtonRef.current
      if (!btn) return

      syncCanvasSize()

      const ro = new ResizeObserver(syncCanvasSize)
      ro.observe(btn)

      return () => {
        ro.disconnect()
        tweenRef.current?.kill()
      }
    }, [syncCanvasSize])

    const drawGrid = (points: PixelCoord[], limit: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = pixelColor

      const targetCount = Math.floor(limit)
      const sizePx = pixelSize * dpr
      for (let i = 0; i < targetCount; i++) {
        const p = points[i]
        if (p) {
          ctx.fillRect(p.x * dpr, p.y * dpr, sizePx, sizePx)
        }
      }
    }

    const handlePointerEnter = (e: React.PointerEvent) => {
      setIsHovered(true)
      const btn = internalButtonRef.current
      if (!btn) return

      syncCanvasSize()

      const rect = btn.getBoundingClientRect()
      const originX = e.clientX - rect.left
      const originY = e.clientY - rect.top

      const cols = Math.ceil(btn.offsetWidth / pixelSize)
      const rows = Math.ceil(btn.offsetHeight / pixelSize)
      const points: PixelCoord[] = []

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * pixelSize
          const y = r * pixelSize
          const dx = x - originX
          const dy = y - originY
          const dist = Math.sqrt(dx * dx + dy * dy)
          points.push({ x, y, distance: dist })
        }
      }

      // Matrix wavefront order
      points.sort((a, b) => a.distance - b.distance + (Math.random() - 0.5) * 6)
      gridRef.current = points

      tweenRef.current?.kill()
      tweenRef.current = gsap.to(progressRef.current, {
        count: points.length,
        duration: 0.42,
        ease: 'power2.out',
        onUpdate: () => drawGrid(points, progressRef.current.count),
        onComplete: () => drawGrid(points, points.length),
      })
    }

    const handlePointerLeave = () => {
      setIsHovered(false)
      const points = gridRef.current
      tweenRef.current?.kill()
      tweenRef.current = gsap.to(progressRef.current, {
        count: 0,
        duration: 0.32,
        ease: 'power2.inOut',
        onUpdate: () => drawGrid(points, progressRef.current.count),
        onComplete: () => {
          const canvas = canvasRef.current
          if (canvas) {
            const ctx = canvas.getContext('2d')
            ctx?.clearRect(0, 0, canvas.width, canvas.height)
          }
        },
      })
    }

    const activeBorderEffect = borderEffect || borderVariant
    const hasSpecialBorder = activeBorderEffect === 'silk' || activeBorderEffect === 'metal'

    const mergedClassName = cn(
      pixelButtonVariants({ variant, size, squircle, className }),
      hasSpecialBorder && 'border-0 border-transparent hover:scale-100',
    )

    const renderAnimatedText = (isHoverLayer: boolean) => {
      if (typeof children === 'string') {
        const chars = Array.from(children)
        return (
          <span className="inline-flex items-center">
            {chars.map((char, index) => {
              const isSpace = char === ' '
              return (
                <motion.span
                  key={index}
                  className="inline-block whitespace-pre"
                  initial={false}
                  animate={
                    isHovered
                      ? isHoverLayer
                        ? { y: 0, opacity: 1, filter: 'none' }
                        : { y: -9, opacity: 0, filter: `blur(${blurAmount})` }
                      : isHoverLayer
                        ? { y: 9, opacity: 0, filter: `blur(${blurAmount})` }
                        : { y: 0, opacity: 1, filter: 'none' }
                  }
                  transition={{
                    duration: 0.28,
                    delay: index * 0.012,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  {isSpace ? '\u00A0' : char}
                </motion.span>
              )
            })}
          </span>
        )
      }

      return (
        <motion.span
          className="inline-flex items-center gap-2"
          initial={false}
          animate={
            isHovered
              ? isHoverLayer
                ? { y: 0, opacity: 1, filter: 'none' }
                : { y: -9, opacity: 0, filter: `blur(${blurAmount})` }
              : isHoverLayer
                ? { y: 9, opacity: 0, filter: `blur(${blurAmount})` }
                : { y: 0, opacity: 1, filter: 'none' }
          }
          transition={{
            duration: 0.28,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {children}
        </motion.span>
      )
    }

    const content = (
      <>
        {/* Background Pixel Flooding Canvas */}
        <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 h-full w-full" />

        {/* Screen Reader Accessible Label */}
        <span className="sr-only">{children}</span>

        {/* Crisp Typography: Initial resting state (blur-reveal motion) */}
        <span
          aria-hidden="true"
          className="relative z-10 pointer-events-none inline-flex items-center gap-2 text-foreground"
        >
          {renderAnimatedText(false)}
        </span>

        {/* Crisp Typography: Hover state (blur-reveal motion) */}
        <span
          aria-hidden="true"
          style={{ color: textColorOnHover }}
          className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center gap-2 font-semibold"
        >
          {renderAnimatedText(true)}
        </span>
      </>
    )

    const dynamicBorderColor =
      !hasSpecialBorder && isHovered && (variant === 'outline' || !variant || variant === 'default')
        ? pixelColor
        : undefined

    const buttonElement = href ? (
      <a
        href={href}
        target={target}
        rel={rel}
        ref={internalButtonRef as any}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={mergedClassName}
        style={{ borderColor: dynamicBorderColor, ...props.style }}
      >
        {content}
      </a>
    ) : (
      <button
        ref={(el) => {
          ;(internalButtonRef as any).current = el
          if (typeof forwardedRef === 'function') {
            forwardedRef(el)
          } else if (forwardedRef) {
            forwardedRef.current = el
          }
        }}
        type="button"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={mergedClassName}
        style={{ borderColor: dynamicBorderColor, ...props.style }}
        {...props}
      >
        {content}
      </button>
    )

    if (activeBorderEffect === 'silk') {
      return (
        <SilkBorder
          preset={silkPreset}
          className={cn(
            'inline-flex transition-transform duration-300 hover:scale-105 p-0.75 cursor-pointer leading-none',
            squircle ? 'squircle rounded-7xl' : 'rounded-lg',
            borderClassName,
          )}
        >
          {buttonElement}
        </SilkBorder>
      )
    }

    if (activeBorderEffect === 'metal') {
      return (
        <LiquidBorder
          preset={metalPreset}
          className={cn(
            'inline-flex transition-transform duration-300 hover:scale-105 p-0.75 cursor-pointer leading-none',
            squircle ? 'squircle rounded-7xl' : 'rounded-lg',
            borderClassName,
          )}
        >
          {buttonElement}
        </LiquidBorder>
      )
    }

    return buttonElement
  },
)

PixelFillButton.displayName = 'PixelFillButton'
