'use client'

import { cn } from '@/registry/lib/utils'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { PreviewLoading } from '@/components/shared/preview-loading'
import { getEffectivePreviewTheme, type ThemeOverride } from '@/config/preview-config'

export default function Iframe({
  name,
  bigScreen = false,
  themeOverride = 'system',
}: {
  name: string
  bigScreen?: boolean
  themeOverride?: 'system' | 'light' | 'dark'
}) {
  const { resolvedTheme } = useTheme()
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [origin, setOrigin] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const effectiveTheme = getEffectivePreviewTheme(themeOverride, resolvedTheme)

  const syncIframeTheme = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument
      if (!doc || !doc.documentElement) return

      doc.documentElement.classList.remove('dark', 'light', 'force-dark', 'force-light')
      if (effectiveTheme === 'dark') {
        doc.documentElement.classList.add('dark', 'force-dark')
      } else {
        doc.documentElement.classList.add('light', 'force-light')
      }
    } catch {
      // Cross-origin fallback
    }
  }, [effectiveTheme])

  useEffect(() => {
    syncIframeTheme()
  }, [syncIframeTheme])

  if (!origin) return <PreviewLoading />

  const [path, query] = name.split('?')
  const src = `${origin}/registry/view/${encodeURIComponent(path)}${query ? `?${query}` : ''}`

  return (
    <div className="relative size-full min-h-0 min-w-0">
      {!loaded && <PreviewLoading className="absolute inset-0 z-10" />}
      <iframe
        ref={iframeRef}
        title={name}
        loading="eager"
        onLoad={() => {
          setLoaded(true)
          syncIframeTheme()
        }}
        src={src}
        className={cn(
          'absolute inset-0 size-full border-0 transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          bigScreen && 'w-400',
        )}
      />
    </div>
  )
}
