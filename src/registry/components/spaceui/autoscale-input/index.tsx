'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'

export type AutoscaleNumberFormat = 'us' | 'eu' | 'space' | 'ch' | 'in' | 'none' | 'string'

export type AutoscaleInputProps = Omit<React.ComponentProps<'input'>, 'size'> & {
  numberFormat?: AutoscaleNumberFormat
  prefix?: string
  suffix?: string
  minSize?: number
  maxSize?: number
  wrapperClassName?: string
  containerClassName?: string
}

const decimalMark = (type: AutoscaleNumberFormat) => (type === 'eu' || type === 'space' ? ',' : '.')

function groupDigits(parts: { int: string; frac: string }, type: AutoscaleNumberFormat) {
  const { int, frac } = parts
  if (type === 'string') return int
  if (!int && !frac) return ''
  const sep = decimalMark(type)
  const groupedInt = int
    ? (() => {
        switch (type) {
          case 'in':
            if (int.length <= 3) return int
            const chunks = [int.slice(-3)]
            let rem = int.slice(0, -3)
            while (rem.length > 0) {
              const step = rem.length >= 2 ? 2 : rem.length
              chunks.unshift(rem.slice(-step))
              rem = rem.slice(0, -step)
            }
            return chunks.join(',')
          case 'us':
            return int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          case 'eu':
            return int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
          case 'space':
            return int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
          case 'ch':
            return int.replace(/\B(?=(\d{3})+(?!\d))/g, "'")
          default:
            return int
        }
      })()
    : '0'
  return frac ? `${groupedInt}${sep}${frac}` : groupedInt
}

function normalizeDigits(val: string, type: AutoscaleNumberFormat) {
  if (type === 'string') return val
  const sep = decimalMark(type)
  let str = val
  switch (type) {
    case 'us':
    case 'in':
      str = str.replace(/,/g, '')
      break
    case 'eu':
      str = str.replace(/\./g, '')
      break
    case 'space':
      str = str.replace(/ /g, '')
      break
    case 'ch':
      str = str.replace(/'/g, '')
      break
  }
  const idx = str.lastIndexOf(sep)
  const parts =
    idx === -1
      ? { int: str.replace(/\D/g, ''), frac: '' }
      : { int: str.slice(0, idx).replace(/\D/g, ''), frac: str.slice(idx + 1).replace(/\D/g, '') }
  if (!parts.int && !parts.frac) return ''
  let fmt = groupDigits(parts, type)
  if (val.endsWith(sep) && !parts.frac) fmt += sep
  return fmt
}

function useFitFontSize({
  minSize = 12,
  maxSize = 512,
  emptyMeasureFallback = '',
  prefixRef,
  suffixRef,
  inputRef,
  watch,
}: {
  minSize?: number
  maxSize?: number
  emptyMeasureFallback?: string
  prefixRef: React.RefObject<HTMLSpanElement | null>
  suffixRef: React.RefObject<HTMLSpanElement | null>
  inputRef?: React.Ref<HTMLInputElement>
  watch?: unknown
}) {
  const elementRef = React.useRef<HTMLInputElement | null>(null)
  const [fontSize, setFontSize] = React.useState<number | null>(null)

  const assignRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      elementRef.current = node
      if (typeof inputRef === 'function') inputRef(node)
      else if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
    },
    [inputRef],
  )

  const measure = React.useCallback(() => {
    const el = elementRef.current
    if (!el || !el.parentElement) return
    const lead = prefixRef.current
    const trail = suffixRef.current
    const maxW = el.parentElement.offsetWidth
    el.style.whiteSpace = 'nowrap'
    el.style.display = 'inline-block'
    const val = el.value
    el.value = val || emptyMeasureFallback || '\xa0'

    const setFontPx = (s: number) => {
      const v = `${s}px`
      el.style.fontSize = v
      if (lead) lead.style.fontSize = v
      if (trail) trail.style.fontSize = v
    }

    const contentWidth = () => (lead?.offsetWidth ?? 0) + el.scrollWidth + (trail?.offsetWidth ?? 0)

    let low = minSize
    let high = maxSize
    while (high - low > 0.5) {
      const mid = (low + high) / 2
      setFontPx(mid)
      if (contentWidth() > maxW) high = mid
      else low = mid
    }

    const resolvedSize = Math.floor(low)
    setFontPx(resolvedSize)
    setFontSize(resolvedSize)
    el.value = val
  }, [minSize, maxSize, emptyMeasureFallback, prefixRef, suffixRef])

  React.useEffect(() => {
    const el = elementRef.current
    const parent = el?.parentElement
    if (!el || !parent) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [measure])

  React.useEffect(() => {
    measure()
  }, [measure, watch])

  return { ref: assignRef, fontSize }
}

export const AutoscaleInput = React.forwardRef<HTMLInputElement, AutoscaleInputProps>(function AutoscaleInput(
  {
    numberFormat = 'us',
    prefix = '$',
    suffix = '',
    minSize = 18,
    maxSize = 100,
    wrapperClassName,
    containerClassName,
    className,
    style,
    value,
    defaultValue,
    onChange,
    placeholder,
    inputMode,
    spellCheck,
    autoComplete = 'off',
    'aria-label': ariaLabel = 'Value',
    ...rest
  },
  ref,
) {
  const isControlled = value !== undefined
  const [localVal, setLocalVal] = React.useState(() => {
    const init = defaultValue?.toString() ?? ''
    return numberFormat === 'string' ? init : normalizeDigits(init, numberFormat)
  })

  const resolvedVal = isControlled ? (value?.toString() ?? '') : localVal
  const resolvedPlaceholder =
    placeholder ?? (numberFormat === 'string' ? 'Type here' : groupDigits({ int: '0', frac: '0' }, numberFormat))
  const leadRef = React.useRef<HTMLSpanElement>(null)
  const trailRef = React.useRef<HTMLSpanElement>(null)

  const { ref: fitRef, fontSize } = useFitFontSize({
    minSize,
    maxSize,
    emptyMeasureFallback: resolvedPlaceholder,
    prefixRef: leadRef,
    suffixRef: trailRef,
    inputRef: ref,
    watch: [resolvedVal, resolvedPlaceholder, minSize, maxSize, prefix, suffix],
  })

  const sizeStyle = fontSize ? { fontSize: `${fontSize}px` } : undefined
  const isBlank = !resolvedVal

  return (
    <div className={cn('mx-auto w-full max-w-sm', containerClassName)}>
      <div
        className={cn(
          'relative flex w-full items-center justify-center overflow-hidden text-center font-semibold tracking-tighter text-foreground',
          wrapperClassName,
        )}
      >
        {prefix ? (
          <span
            ref={leadRef}
            className={cn('shrink-0 text-foreground', isBlank && 'text-foreground/20')}
            style={sizeStyle}
          >
            {prefix}
          </span>
        ) : null}
        <input
          {...rest}
          ref={fitRef}
          type="text"
          inputMode={inputMode ?? (numberFormat === 'string' ? 'text' : 'decimal')}
          autoComplete={autoComplete}
          spellCheck={spellCheck ?? numberFormat === 'string'}
          value={resolvedVal}
          placeholder={resolvedPlaceholder}
          onChange={(event) => {
            const parsed = normalizeDigits(event.target.value, numberFormat)
            if (!isControlled) setLocalVal(parsed)
            onChange?.({
              ...event,
              target: { ...event.target, value: parsed },
              currentTarget: { ...event.currentTarget, value: parsed },
            } as React.ChangeEvent<HTMLInputElement>)
          }}
          aria-label={ariaLabel}
          className={cn(
            'min-w-0 cursor-text border-0 bg-transparent p-0 text-center text-base text-inherit outline-none sm:text-sm',
            'caret-foreground placeholder:text-foreground/20',
            'appearance-none shadow-none ring-0 focus-visible:outline-none',
            className,
          )}
          style={{ ...sizeStyle, ...style }}
        />
        {suffix ? (
          <span
            ref={trailRef}
            className={cn('shrink-0 text-foreground', isBlank && 'text-foreground/20')}
            style={sizeStyle}
          >
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
})
