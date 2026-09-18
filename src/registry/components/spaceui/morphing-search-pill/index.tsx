'use client'

import * as React from 'react'
import { useSpring } from 'motion/react'
import { cn } from '@/registry/lib/utils'

export type MorphingSearchPillProps = {
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (val: string) => void
  onSearch?: (query: string) => void
  collapsedWidth?: number
  expandedWidth?: number
  width?: number
  spring?: number
  corner?: number
  className?: string
}

const DEFAULT_SHUT_SIZE = 64
const DEFAULT_EXPANDED_WIDTH = 320
const INSET = 18
const LENS_SIZE = 28
const MAX_CORNER = 32

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))

export function MorphingSearchPill({
  placeholder = 'Search...',
  value: controlledValue,
  defaultValue = '',
  onChange,
  onSearch,
  collapsedWidth = DEFAULT_SHUT_SIZE,
  expandedWidth,
  width,
  spring = 50,
  corner = MAX_CORNER,
  className,
}: MorphingSearchPillProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const query = isControlled ? controlledValue : internalValue

  const [isOpen, setIsOpen] = React.useState(false)
  const [isPressing, setIsPressing] = React.useState(false)
  const [isBusy, setIsBusy] = React.useState(false)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const busyTimerRef = React.useRef<number>(0)
  const openTimerRef = React.useRef<number>(0)

  // Responsive target width
  const targetExpanded = expandedWidth ?? width ?? DEFAULT_EXPANDED_WIDTH
  const minWidth = Math.max(DEFAULT_SHUT_SIZE, collapsedWidth)
  const maxWidth = Math.max(minWidth, targetExpanded)

  // Spring physics for width morphing
  const springStiffness = 300 + clamp(spring, 0, 100) * 2.5
  const springDamping = 28 + (100 - clamp(spring, 0, 100)) * 0.15

  const widthMotion = useSpring(isOpen ? maxWidth : minWidth, {
    stiffness: springStiffness,
    damping: springDamping,
  })

  const [currentWidth, setCurrentWidth] = React.useState(isOpen ? maxWidth : minWidth)

  React.useEffect(() => {
    widthMotion.set(isOpen ? maxWidth : minWidth)
  }, [isOpen, maxWidth, minWidth, widthMotion])

  React.useEffect(() => {
    const unsubscribe = widthMotion.on('change', (latest) => {
      setCurrentWidth(latest)
    })
    return () => unsubscribe()
  }, [widthMotion])

  React.useEffect(() => {
    return () => {
      window.clearTimeout(busyTimerRef.current)
      window.clearTimeout(openTimerRef.current)
    }
  }, [])

  const handleOpen = () => {
    if (isOpen) return
    setIsPressing(true)
    window.clearTimeout(openTimerRef.current)
    openTimerRef.current = window.setTimeout(() => {
      setIsPressing(false)
      setIsOpen(true)
      inputRef.current?.focus()
    }, 90)
  }

  const handleBlur = () => {
    if (!query.trim()) {
      setIsOpen(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!isControlled) {
      setInternalValue(val)
    }
    onChange?.(val)
    onSearch?.(val)

    // Pulse busy lens stroke on keystroke
    setIsBusy(true)
    window.clearTimeout(busyTimerRef.current)
    busyTimerRef.current = window.setTimeout(() => setIsBusy(false), 340)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (!isControlled) {
        setInternalValue('')
      }
      onChange?.('')
      onSearch?.('')
      setIsOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter') {
      onSearch?.(query)
    }
  }

  // Calculate text visibility during spring expansion
  const expansionProgress = clamp((currentWidth - minWidth) / Math.max(1, maxWidth - minWidth), 0, 1)
  const textVisibility = clamp((expansionProgress - 0.55) / 0.45, 0, 1)
  const clampedCorner = clamp(corner, 0, MAX_CORNER)

  return (
    <div
      className={cn('sek select-none', className)}
      data-open={isOpen}
      data-press={isPressing}
      data-busy={isBusy}
      style={{
        // @ts-expect-error CSS variable
        '--sek-r': `${clampedCorner}px`,
        '--w': `${currentWidth.toFixed(2)}px`,
        '--p': expansionProgress.toFixed(3),
        '--say': textVisibility.toFixed(3),
        '--inset': `${INSET}px`,
        '--lens': `${LENS_SIZE}px`,
        '--shut': `${DEFAULT_SHUT_SIZE}px`,
        '--frame': `${maxWidth + 26}px`,
        '--frameh': '104px',
      }}
    >
      <style>{`
        .sek {
          width: var(--frame, 380px);
          height: var(--frameh, 96px);
          font-family: var(--font-ui, sans-serif);
          place-items: center;
          display: grid;
          position: relative;
        }
        .sek-skin {
          width: var(--w);
          height: var(--shut, 64px);
          border-radius: var(--sek-r, 999px);
          background: var(--muted, #f4f4f5);
          isolation: isolate;
          transform: scale(var(--sk, 1));
          transition: transform 0.26s cubic-bezier(0.22, 0.9, 0.28, 1), background 0.22s;
          position: relative;
          overflow: hidden;
        }
        .sek:not([data-open="true"]) .sek-skin:hover {
          --sk: 1.045;
        }
        .sek[data-press="true"] .sek-skin {
          --sk: 0.93;
          transition: transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
        }
        .sek[data-open="true"] .sek-skin {
          cursor: text;
        }
        .sek-lens {
          left: var(--inset, 18px);
          width: var(--lens, 28px);
          height: var(--lens, 28px);
          margin-top: calc(var(--lens, 28px) / -2);
          fill: none;
          stroke: var(--muted-foreground, #71717a);
          stroke-width: 1.6px;
          stroke-linecap: round;
          pointer-events: none;
          transition: stroke 0.2s, stroke-width 0.2s;
          position: absolute;
          top: 50%;
        }
        .sek-skin:hover .sek-lens {
          stroke: var(--foreground, #09090b);
        }
        .sek[data-open="true"] .sek-lens {
          stroke: var(--muted-foreground, #a1a1aa);
        }
        .sek[data-busy="true"] .sek-lens {
          stroke: var(--foreground, #09090b);
          stroke-width: 2.2px;
        }
        .sek-field {
          left: calc(var(--inset, 18px) + var(--lens, 28px) + 11px);
          height: 100%;
          font: inherit;
          letter-spacing: -0.005em;
          color: var(--foreground, #09090b);
          opacity: var(--say, 0);
          transform: translateX(calc((1 - var(--say, 0)) * -6px));
          pointer-events: var(--say-hit, none);
          background: transparent;
          border: 0;
          outline: none;
          font-size: 1rem;
          position: absolute;
          top: 0;
          right: 1.125rem;
        }
        .sek[data-open="true"] .sek-field {
          --say-hit: auto;
        }
        .sek-field::placeholder {
          color: var(--muted-foreground, #a1a1aa);
        }
        .sek-hit {
          border-radius: inherit;
          cursor: pointer;
          background: transparent;
          border: 0;
          position: absolute;
          inset: 0;
        }
        .sek-hit:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        .dark .sek-skin {
          background: var(--muted, #27272a);
        }
        .dark .sek-field {
          color: #f4f4f5;
        }
        .dark .sek-lens {
          stroke: #a1a1aa;
        }
        .dark .sek-skin:hover .sek-lens,
        .dark .sek[data-busy="true"] .sek-lens {
          stroke: #ffffff;
        }
      `}</style>

      <div className="sek-skin">
        {/* Search Lens SVG Icon */}
        <svg className="sek-lens" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="7.6" cy="7.6" r="5.4" />
          <path d="M11.6 11.6 L15.4 15.4" />
        </svg>

        {/* Morphing Input Field */}
        <input
          ref={inputRef}
          className="sek-field"
          type="text"
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
          tabIndex={isOpen ? 0 : -1}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />

        {/* Invisible hit area covering the whole pill when collapsed — clicking anywhere opens it */}
        {!isOpen && <button type="button" className="sek-hit" aria-label="Open search" onClick={handleOpen} />}
      </div>
    </div>
  )
}
