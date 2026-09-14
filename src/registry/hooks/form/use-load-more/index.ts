'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { sleep } from '@/registry/utils/sleep'
import { logger } from '@/registry/utils/logger'

export type LoadMoreFetcher = (page: number) => Promise<any> | any

export interface UseLoadMoreOptions<T = any> {
  dataSource?: T[]
  fetcher?: LoadMoreFetcher
  initialCount?: number
  incrementCount?: number
  initialPage?: number
}

export interface UseLoadMoreReturn<T = any> {
  data: T[]
  loading: boolean
  error: Error | null
  hasMore: boolean
  loadMore: () => Promise<void>
  totalItems: number
  loadedItems: number
  page: number
  reset: () => void
}

/**
 * Universal React hook for loading more items or triggering paginated async data fetching.
 * Supports both client-side array slicing and server-side async fetcher functions.
 *
 * @param {UseLoadMoreOptions<T> | LoadMoreFetcher} optionsOrFetcher - Configuration options or async fetcher callback.
 * @returns {UseLoadMoreReturn<T>} Pagination state, controls, and loadMore.
 *
 * @example
 * // Pattern 1: Async fetcher function
 * const { loading, loadMore, hasMore } = useLoadMore(async (page) => {
 *   await fetchNextPage(page);
 * });
 *
 * // Pattern 2: Client-side dataSource array
 * const { data, loadMore, loading, hasMore } = useLoadMore({
 *   dataSource: allItems,
 *   initialCount: 5,
 *   incrementCount: 5,
 * });
 */
export function useLoadMore<T = any>(optionsOrFetcher?: UseLoadMoreOptions<T> | LoadMoreFetcher): UseLoadMoreReturn<T> {
  const isFetcherFn = typeof optionsOrFetcher === 'function'

  const options: UseLoadMoreOptions<T> = isFetcherFn
    ? { fetcher: optionsOrFetcher as LoadMoreFetcher }
    : optionsOrFetcher || {}

  const { dataSource, fetcher, initialCount = 3, incrementCount = 3, initialPage = 1 } = options

  const [loadedItems, setLoadedItems] = useState<number>(initialCount)
  const [page, setPage] = useState<number>(initialPage)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMoreState, setHasMoreState] = useState<boolean>(true)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  // Reset when dataSource changes
  useEffect(() => {
    if (dataSource) {
      setLoadedItems(initialCount)
    }
  }, [dataSource, initialCount])

  // Derived client-side data
  const data = useMemo(() => {
    if (!dataSource || dataSource.length === 0) return []
    return dataSource.slice(0, loadedItems)
  }, [dataSource, loadedItems])

  const hasMore = useMemo(() => {
    if (dataSource) {
      return loadedItems < dataSource.length
    }
    return hasMoreState
  }, [dataSource, loadedItems, hasMoreState])

  const totalItems = dataSource ? dataSource.length : loadedItems

  const loadMore = useCallback(async () => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      if (fetcherRef.current) {
        const nextPage = page + 1
        const res = await fetcherRef.current(nextPage)
        setPage(nextPage)
        if (res && typeof res === 'object' && 'hasMore' in res) {
          setHasMoreState(Boolean(res.hasMore))
        }
      } else if (dataSource) {
        await sleep(500)
        setLoadedItems((prev) => Math.min(prev + incrementCount, dataSource.length))
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      logger.error('Error in useLoadMore:', errorObj)
      throw errorObj
    } finally {
      setLoading(false)
    }
  }, [loading, page, dataSource, incrementCount])

  const reset = useCallback(() => {
    setLoadedItems(initialCount)
    setPage(initialPage)
    setHasMoreState(true)
    setError(null)
  }, [initialCount, initialPage])

  return {
    data,
    loadMore,
    loading,
    error,
    hasMore,
    loadedItems,
    totalItems,
    page,
    reset,
  }
}
