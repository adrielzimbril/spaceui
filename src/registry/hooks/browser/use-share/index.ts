'use client'

import { useCallback } from 'react'
import { logger } from '@/registry/utils/logger'

/**
 * React hook to trigger the Web Share API on supported devices.
 *
 * @returns {[(data: ShareData) => Promise<boolean>, { isSupported: boolean }]} A tuple of [shareFunction, { isSupported }].
 *
 * @example
 * const [share, { isSupported }] = useShare();
 * if (isSupported) {
 *   await share({ title: 'Space UI', url: 'https://spaceui.dev' });
 * }
 */
export function useShare() {
  const isSupported = typeof navigator !== 'undefined' && Boolean(navigator.share)

  const share = useCallback(
    async (data: ShareData): Promise<boolean> => {
      if (!isSupported) {
        logger.warn('Web Share API is not supported on this browser.')
        return false
      }
      try {
        await navigator.share(data)
        return true
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          logger.error('Error sharing content:', err)
        }
        return false
      }
    },
    [isSupported],
  )

  return [share, { isSupported }] as const
}
