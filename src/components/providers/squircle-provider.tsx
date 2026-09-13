'use client'

import * as React from 'react'
import { initSquircle } from '@usespaceui/squircle'

initSquircle()

export function SquircleProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
