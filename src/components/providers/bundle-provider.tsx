'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '@/registry/hooks/browser/use-local-storage'

export type BundleItem = {
  slug: string
  title: string
  category?: string
}

const STORAGE_KEY = 'space-ui-bundle-v1'

const mergeItems = (state: BundleItem[], incoming: BundleItem[]): BundleItem[] => {
  const bySlug = new Map(state.map((i) => [i.slug, i]))
  for (const item of incoming) {
    if (!bySlug.has(item.slug)) {
      bySlug.set(item.slug, item)
    }
  }
  return [...bySlug.values()]
}

export const prettify = (slug: string) =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const parseBundleParam = (search: string): BundleItem[] => {
  const param = new URLSearchParams(search).get('bundle') || new URLSearchParams(search).get('kit')
  if (!param) return []
  const seen = new Set<string>()
  return param
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[a-z0-9-]+$/.test(s) && !seen.has(s) && seen.add(s))
    .map((slug) => ({ slug, title: prettify(slug) }))
}

type BundleContextValue = {
  items: BundleItem[]
  count: number
  message: string
  has: (slug: string) => boolean
  add: (item: BundleItem) => void
  addMany: (items: BundleItem[]) => void
  remove: (slug: string) => void
  removeMany: (slugs: string[]) => void
  toggle: (item: BundleItem) => void
  clear: () => void
}

const BundleContext = createContext<BundleContextValue | null>(null)

export function BundleProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems, removeItemsStorage] = useLocalStorage<BundleItem[]>(STORAGE_KEY, [])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const shared = parseBundleParam(window.location.search)
    if (shared.length > 0) {
      setItems((current) => mergeItems(current, shared))
      const url = new URL(window.location.href)
      url.searchParams.delete('bundle')
      url.searchParams.delete('kit')
      window.history.replaceState({}, '', url)
    }
  }, [setItems])

  useEffect(() => {
    const channel = new BroadcastChannel(STORAGE_KEY)
    const onMessage = (event: MessageEvent<BundleItem[]>) => {
      if (!Array.isArray(event.data)) return
      setItems((current) =>
        JSON.stringify(current) === JSON.stringify(event.data) ? current : event.data,
      )
    }
    channel.addEventListener('message', onMessage)
    return () => {
      channel.removeEventListener('message', onMessage)
      channel.close()
    }
  }, [setItems])

  useEffect(() => {
    const channel = new BroadcastChannel(STORAGE_KEY)
    channel.postMessage(items)
    channel.close()
  }, [items])

  const value = useMemo<BundleContextValue>(
    () => ({
      add: (item) => {
        setItems((current) => mergeItems(current, [item]))
        setMessage(`${item.title} added to bundle`)
      },
      addMany: (next) => {
        setItems((current) => mergeItems(current, next))
        setMessage(next.length === 1 ? `${next[0].title} added to bundle` : `${next.length} components added to bundle`)
      },
      clear: () => {
        removeItemsStorage()
        setMessage('Bundle cleared')
      },
      count: items.length,
      has: (slug) => items.some((i) => i.slug === slug),
      items,
      message,
      remove: (slug) => {
        const removed = items.find((i) => i.slug === slug)
        setItems((current) => current.filter((i) => i.slug !== slug))
        setMessage(removed ? `${removed.title} removed from bundle` : 'Item removed from bundle')
      },
      removeMany: (slugs) => {
        const drop = new Set(slugs)
        setItems((current) => current.filter((i) => !drop.has(i.slug)))
        setMessage(
          slugs.length === 1 ? '1 component removed from bundle' : `${slugs.length} components removed from bundle`,
        )
      },
      toggle: (item) => {
        const exists = items.some((i) => i.slug === item.slug)
        setItems((current) => (exists ? current.filter((i) => i.slug !== item.slug) : [...current, item]))
        setMessage(exists ? `${item.title} removed from bundle` : `${item.title} added to bundle`)
      },
    }),
    [items, message, setItems, removeItemsStorage],
  )

  return <BundleContext.Provider value={value}>{children}</BundleContext.Provider>
}

export function useBundle() {
  const ctx = useContext(BundleContext)
  if (!ctx) {
    throw new Error('useBundle must be used within a BundleProvider')
  }
  return ctx
}
