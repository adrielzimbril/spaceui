'use client'

import * as React from 'react'
import { initSquircle } from '@usespaceui/squircle'

// Initialize immediately on client evaluation to avoid layout shifts or unstyled curvature
if (typeof window !== 'undefined') {
  try {
    initSquircle()
  } catch (e) {
    // Ignore Houdini worklet errors on unsupported browsers
  }
}

export function SquircleProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    try {
      initSquircle()
    } catch (e) {
      // Ignore
    }
  }, [])

  return <>{children}</>
}
