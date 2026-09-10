'use client'

import { useEffect } from 'react'
import { initSquircle } from '@usespaceui/squircle'

export function SquircleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSquircle()
  }, [])

  return <>{children}</>
}
