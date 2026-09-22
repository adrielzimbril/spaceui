'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEventListener } from '@/registry/hooks/dom/use-event-listener'
import { logger } from '@/registry/utils/logger'

/**
 * React hook to synchronize state with the browser's `localStorage`.
 *
 * @template T
 * @param {string} key - The localStorage storage key.
 * @param {T} initialValue - The fallback initial value.
 * @returns {[T, (value: T | ((val: T) => T)) => void, () => void]} A tuple of [storedValue, setValue, removeValue].
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'dark');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return
      try {
        setStoredValue(JSON.parse(item))
      } catch {
        setStoredValue(item as unknown as T)
      }
    } catch (error) {
      logger.warn(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') return
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        logger.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      logger.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  useEventListener('storage', (e: StorageEvent) => {
    if (e.key !== key) return
    if (e.newValue === null) {
      setStoredValue(initialValue)
      return
    }
    try {
      try {
        setStoredValue(JSON.parse(e.newValue))
      } catch {
        setStoredValue(e.newValue as unknown as T)
      }
    } catch (error) {
      logger.warn(`Error syncing localStorage key "${key}":`, error)
    }
  })

  return [storedValue, setValue, removeValue]
}
