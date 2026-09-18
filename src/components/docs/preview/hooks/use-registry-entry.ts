'use client'

import * as React from 'react'

export interface PublicRegistryFile {
  path: string
  type: string
  target?: string
  content: string
}

export interface PublicRegistryEntry {
  name: string
  description?: string
  type: string
  isPro?: boolean
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files: PublicRegistryFile[]
  meta?: {
    isPro?: boolean
    demoProps?: Record<string, unknown>
    keywords?: string[]
  }
}

export function useRegistryEntry(name: string | null) {
  const [entry, setEntry] = React.useState<PublicRegistryEntry | null>(null)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const controller = new AbortController()

    setEntry(null)
    setError(null)

    if (!name) return () => controller.abort()

    fetch(`/r/${encodeURIComponent(name)}.json`, {
      signal: controller.signal,
      cache: process.env.NODE_ENV === 'development' ? 'no-cache' : 'force-cache',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Registry item "${name}" returned ${response.status}.`)
        }

        return (await response.json()) as PublicRegistryEntry
      })
      .then(setEntry)
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setError(reason instanceof Error ? reason : new Error(`Unable to load registry item "${name}".`))
      })

    return () => controller.abort()
  }, [name])

  return { entry, error }
}
