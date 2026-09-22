'use client'

import { useState, useCallback } from 'react'
import { logger } from '@/registry/utils/logger'

/**
 * React hook to synchronize state with the browser's `sessionStorage`.
 *
 * @template T
 * @param {string} key - The sessionStorage key.
 * @param {T} initialValue - The initial fallback value.
 * @returns {[T, (value: T | ((val: T) => T)) => void, () => void]} A tuple of [storedValue, setValue, removeValue].
 *
 * @example
 * const [step, setStep, clearStep] = useSessionStorage('checkout_step', 1);
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      logger.warn(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') return
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        logger.warn(`Error setting sessionStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      logger.warn(`Error removing sessionStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
