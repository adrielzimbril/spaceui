'use client'

import * as React from 'react'
import type { GeneratingOrbProps } from './types'

export function GeneratingOrbCss({
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
  const characters = React.useMemo(() => Array.from(text), [text])

  const effectiveHaloAlt = haloAltColor ?? haloColorAlt
  const effectiveCoreAlt = coreAltColor ?? coreColorAlt

  // In HorizonX: --og-unit is size / 180
  const ogUnit = size / 180

  // Duration in ms
  const durationMs = duration ?? (speed < 30 ? speed * 1000 : speed)
  const staggerMs = stagger < 1 ? stagger * 1000 : stagger

  return (
    <div
      className={`og-frame relative inline-flex items-center justify-center select-none ${className}`}
      style={
        {
          '--og-stage': stageColor,
          '--og-size': `${size}px`,
          '--og-unit': ogUnit,
          '--og-depth': depth,
          '--og-highlight': highlightColor,
          '--og-halo': haloColor,
          '--og-core': coreColor,
          '--og-halo-alt': effectiveHaloAlt,
          '--og-core-alt': effectiveCoreAlt,
          '--og-text': textColor,
          '--og-text-size': textSize,
          '--og-tracking': `${tracking}px`,
          '--og-rest': restOpacity,
          '--og-duration': `${durationMs}ms`,
          '--og-stagger': `${staggerMs}ms`,
          '--og-pop': pop,
          width: 'var(--og-size)',
          height: 'var(--og-size)',
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <style>{`
        @keyframes og-rotate {
          0% {
            transform: rotate(90deg);
            box-shadow:
              0 calc(10px * var(--og-unit) * var(--og-depth)) calc(20px * var(--og-unit) * var(--og-depth)) 0 var(--og-highlight) inset,
              0 calc(20px * var(--og-unit) * var(--og-depth)) calc(30px * var(--og-unit) * var(--og-depth)) 0 var(--og-halo) inset,
              0 calc(60px * var(--og-unit) * var(--og-depth)) calc(60px * var(--og-unit) * var(--og-depth)) 0 var(--og-core) inset;
          }
          50% {
            transform: rotate(270deg);
            box-shadow:
              0 calc(10px * var(--og-unit) * var(--og-depth)) calc(20px * var(--og-unit) * var(--og-depth)) 0 var(--og-highlight) inset,
              0 calc(20px * var(--og-unit) * var(--og-depth)) calc(10px * var(--og-unit) * var(--og-depth)) 0 var(--og-halo-alt) inset,
              0 calc(40px * var(--og-unit) * var(--og-depth)) calc(60px * var(--og-unit) * var(--og-depth)) 0 var(--og-core-alt) inset;
          }
          100% {
            transform: rotate(450deg);
            box-shadow:
              0 calc(10px * var(--og-unit) * var(--og-depth)) calc(20px * var(--og-unit) * var(--og-depth)) 0 var(--og-highlight) inset,
              0 calc(20px * var(--og-unit) * var(--og-depth)) calc(30px * var(--og-unit) * var(--og-depth)) 0 var(--og-halo) inset,
              0 calc(60px * var(--og-unit) * var(--og-depth)) calc(60px * var(--og-unit) * var(--og-depth)) 0 var(--og-core) inset;
          }
        }
        @keyframes og-letter {
          0%, 100% {
            opacity: var(--og-rest);
            transform: translateY(0);
          }
          20% {
            opacity: 1;
            transform: scale(var(--og-pop));
          }
          40% {
            opacity: calc(var(--og-rest) + (1 - var(--og-rest)) * 0.5);
            transform: translateY(0);
          }
        }
        .og-loader {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--og-size);
          height: var(--og-size);
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
          font-size: calc(var(--og-text-size) * var(--og-unit) * 16px);
          font-weight: 300;
          letter-spacing: var(--og-tracking);
          color: var(--og-text);
          border-radius: 50%;
          background-color: transparent;
          user-select: none;
        }
        .og-word {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }
        .og-orb {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
          width: 100%;
          aspect-ratio: 1/1;
          border-radius: 50%;
          background-color: transparent;
          transform: rotate(90deg);
          box-shadow:
            0 calc(10px * var(--og-unit) * var(--og-depth)) calc(20px * var(--og-unit) * var(--og-depth)) 0 var(--og-highlight) inset,
            0 calc(20px * var(--og-unit) * var(--og-depth)) calc(30px * var(--og-unit) * var(--og-depth)) 0 var(--og-halo) inset,
            0 calc(60px * var(--og-unit) * var(--og-depth)) calc(60px * var(--og-unit) * var(--og-depth)) 0 var(--og-core) inset;
          animation: og-rotate var(--og-duration) linear infinite;
        }
        .og-letter {
          display: inline-block;
          opacity: var(--og-rest);
          transform: translateY(0);
          animation: og-letter var(--og-duration) infinite;
          animation-delay: calc(var(--i) * var(--og-stagger));
          will-change: transform, opacity;
        }
        .og-loader[data-playback='pause'] .og-orb,
        .og-loader[data-playback='pause'] .og-letter {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .og-orb, .og-letter { animation: none; }
          .og-letter { opacity: 1; }
        }
      `}</style>

      <div
        className="og-loader"
        role="status"
        aria-live="polite"
        aria-label={text}
        data-playback={playback}
      >
        {showText && text && (
          <span className="og-word">
            {characters.map((char, index) => (
              <span
                key={`${char}-${index}`}
                className="og-letter"
                style={{ '--i': index } as React.CSSProperties}
                aria-hidden="true"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
        )}

        {/* The rotating inset shadow orb */}
        <span className="og-orb" aria-hidden="true" />
      </div>

      {children}
    </div>
  )
}
