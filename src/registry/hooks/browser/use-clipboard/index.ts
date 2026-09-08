'use client'

import * as React from 'react'

/**
 * Options for the `useClipboard` hook.
 */
export interface UseClipboardOptions {
  /** Timeout in milliseconds before `hasCopied` resets back to `false` (default: 2000ms). */
  timeout?: number
  /** Optional callback invoked when copy succeeds. */
  onSuccess?: (text: string) => void
  /** Optional callback invoked when copy succeeds (alias for onSuccess). */
  onCopy?: (text: string) => void
  /** Optional callback invoked when copy fails. */
  onError?: (error: Error) => void
}

/**
 * Return type of the `useClipboard` hook.
 */
export interface UseClipboardReturn {
  /** Current value successfully copied to the clipboard. */
  value: string
  /** Boolean indicating whether a copy operation recently succeeded. */
  hasCopied: boolean
  /** Alias for `hasCopied`. */
  copied: boolean
  /** Alias for `hasCopied`. */
  isCopied: boolean
  /** Function to copy text to clipboard. */
  copy: (text: string) => Promise<boolean>
  /** Alias for `copy`. */
  copyToClipboard: (text: string) => Promise<boolean>
  /** Resets `hasCopied` back to `false` immediately. */
  reset: () => void
}

/**
 * React hook to safely copy text to the system clipboard with automatic timeout reset.
 *
 * @param {UseClipboardOptions} [options={}] - Configuration options.
 * @returns {UseClipboardReturn} Clipboard state and copy controls.
 *
 * @example
 * const { copy, copied } = useClipboard({ timeout: 2000 });
 *
 * return (
 *   <button onClick={() => copy('npx shadcn add @spaceui/hooks-browser-use-clipboard')}>
 *     {copied ? 'Copied!' : 'Copy Command'}
 *   </button>
 * );
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000, onSuccess, onCopy, onError } = options
  const [hasCopied, setHasCopied] = React.useState(false)
  const [value, setValue] = React.useState('')
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  React.useEffect(() => () => clearTimer(), [clearTimer])

  const copy = React.useCallback(
    async (text: string): Promise<boolean> => {
      if (typeof window === 'undefined' || !navigator?.clipboard?.writeText) {
        const error = new Error('Clipboard API is not available.')
        onError?.(error)
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        setValue(text)
        setHasCopied(true)
        onSuccess?.(text)
        onCopy?.(text)

        clearTimer()
        timeoutRef.current = setTimeout(() => {
          setHasCopied(false)
        }, timeout)

        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        onError?.(error)
        return false
      }
    },
    [clearTimer, onError, onSuccess, timeout],
  )

  const reset = React.useCallback(() => {
    clearTimer()
    setHasCopied(false)
    setValue('')
  }, [clearTimer])

  return {
    value,
    hasCopied,
    copied: hasCopied,
    isCopied: hasCopied,
    copy,
    copyToClipboard: copy,
    reset,
  }
}

export const useCopyToClipboard = useClipboard
