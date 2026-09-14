'use client'

import * as React from 'react'
import { initSquircle } from '@usespaceui/squircle'

if (typeof window !== 'undefined') {
  initSquircle()
}

export function SquircleProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
