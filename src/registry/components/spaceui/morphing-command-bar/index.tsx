'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { IconArrowUp, IconMicrophone } from '@tabler/icons-react'
import { cn } from '@/registry/lib/utils'

export type MorphingCommandBarProps = {
  placeholder?: string
  value?: string
  defaultValue?: string
  onSubmit?: (query: string) => void
  onMicClick?: () => void
  onChange?: (value: string) => void
  bridge?: number
  edge?: number
  corner?: number
  className?: string
}

const DEFAULT_CORNER_REM = 1.75 // 28px
const BAR_WIDTH_REM = 16.5 // 264px
const BAR_HEIGHT_REM = 3.5 // 56px
const BTN_WIDTH_REM = 3 // 48px
const GAP_REM = 0.5 // 8px
const TOTAL_WIDTH_REM = 20 // 320px
const RETRACTED_OFFSET_REM = '-3.5rem' // -(BTN_WIDTH + GAP)

const MORPH_TRANSITION = {
  duration: 0.52,
  ease: [0.22, 1.3, 0.71, 1] as const,
}

export function MorphingCommandBar({
  placeholder = 'Ask anything...',
  value: controlledValue,
  defaultValue = '',
  onSubmit,
  onMicClick,
  onChange,
  bridge = 3,
  edge = 22,
  corner = 28,
  className,
}: MorphingCommandBarProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const query = isControlled ? controlledValue : uncontrolledValue

  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const filterId = React.useId().replace(/:/g, '')

  const hasContent = !!query.trim()
  // Expands when focused OR has content — matching the original
  const isExpanded = isFocused || hasContent

  const cornerRem = corner / 16 || DEFAULT_CORNER_REM
  const clampedCornerRem = Math.min(BAR_HEIGHT_REM / 2, Math.max(0, cornerRem))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value
    if (!isControlled) {
      setUncontrolledValue(nextVal)
    }
    onChange?.(nextVal)
  }

  const handleSubmit = () => {
    if (hasContent) {
      onSubmit?.(query)
      if (!isControlled) {
        setUncontrolledValue('')
      }
    }
  }

  return (
    <div
      className={cn('relative inline-block select-none font-sans', className)}
      style={{
        width: `${TOTAL_WIDTH_REM}rem`,
        height: `${BAR_HEIGHT_REM}rem`,
      }}
    >
      {/* SVG Gooey Filter — blur then steep alpha contrast creates the liquid neck */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={bridge} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${edge} -${Math.floor(edge / 2)}`}
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Gooey silhouette layer — bar stays fixed, button walks out from under its right edge */}
      <div className="absolute inset-0 pointer-events-none" style={{ filter: `url(#${filterId})` }} aria-hidden="true">
        {/* Bar silhouette — never moves */}
        <div
          style={{
            width: `${BAR_WIDTH_REM}rem`,
            height: `${BAR_HEIGHT_REM}rem`,
            borderRadius: `${clampedCornerRem}rem`,
          }}
          className="absolute left-0 top-0 bg-muted"
        />

        {/* Send button silhouette — offset is all on the button; bar holds still */}
        <motion.div
          initial={false}
          animate={{ x: isExpanded ? '0rem' : RETRACTED_OFFSET_REM }}
          transition={MORPH_TRANSITION}
          style={{
            left: `${BAR_WIDTH_REM + GAP_REM}rem`,
            top: 0,
            width: `${BTN_WIDTH_REM}rem`,
            height: `${BAR_HEIGHT_REM}rem`,
            borderRadius: `${clampedCornerRem}rem`,
          }}
          className="absolute bg-muted"
        />
      </div>

      {/* Interactive controls — crisp text and icons above the goo layer */}
      <div className="relative w-full h-full">
        {/* Bar with input and mic */}
        <div
          style={{
            width: `${BAR_WIDTH_REM}rem`,
            height: `${BAR_HEIGHT_REM}rem`,
          }}
          className="absolute left-0 top-0 flex items-center px-[1.25rem]"
        >
          <input
            ref={inputRef}
            value={query}
            placeholder={placeholder}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit()
              }
              if (e.key === 'Escape') {
                e.currentTarget.blur()
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent border-0 outline-none text-[0.9375rem] text-foreground placeholder:text-muted-foreground min-w-0 tracking-tight pr-[2rem]"
          />

          {/* Mic — only ever fades. No scale, no travel. Pure CSS opacity via data-show */}
          <button
            type="button"
            className="cmd-mic absolute right-[0.75rem] size-[2rem] rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-show={!isExpanded}
            tabIndex={isExpanded ? -1 : 0}
            aria-hidden={isExpanded}
            aria-label="Dictate"
            onClick={onMicClick}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <IconMicrophone className="size-[1.125rem]" strokeWidth={2} />
          </button>

          <style>{`
            .cmd-mic { opacity: 0; transition: opacity 150ms ease; }
            .cmd-mic[data-show="true"] { opacity: 1; }
          `}</style>
        </div>

        {/* Send button — walks out in sync with its silhouette */}
        <motion.button
          type="button"
          tabIndex={isExpanded ? 0 : -1}
          aria-hidden={!isExpanded}
          aria-label="Send"
          onClick={handleSubmit}
          disabled={!hasContent}
          initial={false}
          animate={{ x: isExpanded ? '0rem' : RETRACTED_OFFSET_REM }}
          transition={MORPH_TRANSITION}
          whileTap={hasContent ? { scale: 0.95 } : undefined}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            left: `${BAR_WIDTH_REM + GAP_REM}rem`,
            top: 0,
            width: `${BTN_WIDTH_REM}rem`,
            height: `${BAR_HEIGHT_REM}rem`,
            borderRadius: `${clampedCornerRem}rem`,
            pointerEvents: isExpanded && hasContent ? 'auto' : 'none',
          }}
          className={cn(
            'absolute flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-150',
            hasContent ? 'cursor-pointer text-foreground' : 'cursor-default text-muted-foreground/40',
          )}
        >
          <motion.span
            initial={false}
            animate={{
              opacity: isExpanded ? 1 : 0,
              scale: isExpanded ? 1 : 0.6,
            }}
            transition={{
              duration: isExpanded ? 0.2 : 0.12,
              delay: isExpanded ? 0.12 : 0,
              ease: isExpanded ? 'easeOut' : 'easeIn',
            }}
            className="flex items-center justify-center"
          >
            <IconArrowUp className="size-[1.25rem]" strokeWidth={2.4} />
          </motion.span>
        </motion.button>
      </div>
    </div>
  )
}
