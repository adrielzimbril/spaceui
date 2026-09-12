'use client'

import * as React from 'react'
import type { GeneratingOrbProps } from './types'

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(clean, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function lerpColor(c1: string, c2: string, t: number): string {
  try {
    const [r1, g1, b1] = hexToRgb(c1)
    const [r2, g2, b2] = hexToRgb(c2)
    const r = Math.round(r1 + (r2 - r1) * t)
    const g = Math.round(g1 + (g2 - g1) * t)
    const b = Math.round(b1 + (b2 - b1) * t)
    return `rgb(${r}, ${g}, ${b})`
  } catch {
    return t < 0.5 ? c1 : c2
  }
}

export function GeneratingOrbCanvas({
  size = 240,
  depth = 1.0,
  speed = 2.0,
  duration,
  stagger = 100,
  pop = 1.15,
  restOpacity = 0.4,
  textSize = 1.2,
  tracking = 0,
  text = 'Generating',
  showText = true,
  highlightColor = '#ffffff',
  haloColor = '#ad5fff',
  coreColor = '#471eec',
  haloAltColor,
  haloColorAlt = '#d60a47',
  coreAltColor,
  coreColorAlt = '#311e80',
  textColor = '#ffffff',
  playback = 'play',
  stageColor = 'transparent',
  className = '',
  style,
  children,
  ...props
}: Omit<GeneratingOrbProps, 'renderer'>) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const characters = React.useMemo(() => Array.from(text), [text])

  const effectiveHaloAlt = haloAltColor ?? haloColorAlt
  const effectiveCoreAlt = coreAltColor ?? coreColorAlt

  const ogUnit = size / 180
  const durationMs = duration ?? (speed < 30 ? speed * 1000 : speed)
  const staggerMs = stagger < 1 ? stagger * 1000 : stagger

  React.useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let animId = 0
    let isDestroyed = false
    let isIntersecting = true
    let startStamp = performance.now()

    const mediaReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')

    const render = (now: number) => {
      if (isDestroyed) return

      if (isIntersecting && !document.hidden && mediaReducedMotion?.matches !== true) {
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        const physSize = Math.round(size * dpr)

        if (canvas.width !== physSize || canvas.height !== physSize) {
          canvas.width = physSize
          canvas.height = physSize
        }

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          ctx.clearRect(0, 0, size, size)

          const radius = size / 2
          const cx = radius
          const cy = radius

          const elapsed = playback === 'play' ? now - startStamp : 0
          const progress = (elapsed % durationMs) / durationMs

          // Starting from 90deg, rotating 360deg
          const theta = Math.PI * 0.5 + progress * Math.PI * 2

          // Half-turn blend factor (0 at 0deg, 1 at 180deg, 0 at 360deg)
          const halfTurnBlend = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2)

          const currentHaloColor = lerpColor(haloColor, effectiveHaloAlt, halfTurnBlend)
          const currentCoreColor = lerpColor(coreColor, effectiveCoreAlt, halfTurnBlend)

          // Layer 1: highlight
          // 0 calc(10px * unit * depth) calc(20px * unit * depth) 0 highlight inset
          const l1Y = 10 * ogUnit * depth
          const l1Blur = 20 * ogUnit * depth

          // Layer 2: halo
          // 0 calc(20px * unit * depth) calc((30 -> 10px) * unit * depth) 0 halo inset
          const l2Y = 20 * ogUnit * depth
          const l2Blur = (30 - 20 * halfTurnBlend) * ogUnit * depth

          // Layer 3: core
          // 0 calc((60 -> 40px) * unit * depth) calc(60px * unit * depth) 0 core inset
          const l3Y = (60 - 20 * halfTurnBlend) * ogUnit * depth
          const l3Blur = 60 * ogUnit * depth

          ctx.save()

          // Clip to orb circle
          ctx.beginPath()
          ctx.arc(cx, cy, radius - 0.5, 0, Math.PI * 2)
          ctx.clip()

          // Rotate coordinate system
          ctx.translate(cx, cy)
          ctx.rotate(theta)

          const layers = [
            { dy: l1Y, blur: l1Blur, color: highlightColor },
            { dy: l2Y, blur: l2Blur, color: currentHaloColor },
            { dy: l3Y, blur: l3Blur, color: currentCoreColor },
          ]

          const pad = radius * 3
          for (const layer of layers) {
            ctx.save()
            ctx.shadowColor = layer.color
            ctx.shadowBlur = layer.blur
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = layer.dy

            ctx.beginPath()
            ctx.rect(-pad, -pad, pad * 2, pad * 2)
            ctx.arc(0, 0, radius - 0.5, 0, Math.PI * 2, true)
            ctx.fillStyle = '#000000'
            ctx.fill()
            ctx.restore()
          }

          ctx.restore()
        }
      }

      if (playback === 'play') {
        animId = requestAnimationFrame(render)
      }
    }

    const intersectionObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              isIntersecting = entry?.isIntersecting !== false
            },
            { rootMargin: '100px' },
          )
        : null
    intersectionObserver?.observe(container)

    animId = requestAnimationFrame(render)

    return () => {
      isDestroyed = true
      if (animId) cancelAnimationFrame(animId)
      intersectionObserver?.disconnect()
    }
  }, [
    size,
    depth,
    durationMs,
    playback,
    ogUnit,
    highlightColor,
    haloColor,
    coreColor,
    effectiveHaloAlt,
    effectiveCoreAlt,
  ])

  return (
    <div
      ref={containerRef}
      className={`og-frame relative inline-flex items-center justify-center select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: stageColor,
        ...style,
      }}
      {...props}
    >
      <div
        className="og-loader relative flex items-center justify-center rounded-full overflow-hidden"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: `calc(${textSize} * ${ogUnit} * 16px)`,
          fontWeight: 300,
          letterSpacing: `${tracking}px`,
          color: textColor,
        }}
        role="status"
        aria-live="polite"
        aria-label={text}
        data-playback={playback}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none block"
          style={{ width: `${size}px`, height: `${size}px` }}
          aria-hidden="true"
        />

        <style>{`
          @keyframes og-canvas-letter {
            0%, 100% {
              opacity: ${restOpacity};
              transform: translateY(0);
            }
            20% {
              opacity: 1;
              transform: scale(${pop});
            }
            40% {
              opacity: ${restOpacity + (1 - restOpacity) * 0.5};
              transform: translateY(0);
            }
          }
          .og-canvas-letter {
            display: inline-block;
            opacity: ${restOpacity};
            transform: translateY(0);
            animation: og-canvas-letter ${durationMs}ms infinite;
            animation-delay: calc(var(--i) * ${staggerMs}ms);
            will-change: transform, opacity;
          }
          .og-loader[data-playback='pause'] .og-canvas-letter {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .og-canvas-letter { animation: none; opacity: 1; }
          }
        `}</style>

        {showText && text && (
          <span className="og-word relative z-10 inline-flex items-center justify-center whitespace-nowrap">
            {characters.map((char, index) => (
              <span
                key={`${char}-${index}`}
                className="og-canvas-letter"
                style={{ '--i': index } as React.CSSProperties}
                aria-hidden="true"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
        )}
      </div>

      {children}
    </div>
  )
}
