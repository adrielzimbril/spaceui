'use client'

import { useEffect, useState } from 'react'
import { useMediaQuery } from '@/registry/hooks/browser/use-media-query'

export function useResourceDesktop() {
  const [ready, setReady] = useState(false)
  const matches = useMediaQuery('(min-width: 768px)', false)

  useEffect(() => {
    setReady(true)
  }, [])

  return ready && matches
}

export function useResourceSidebars() {
  const isDesktop = useResourceDesktop()
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  useEffect(() => {
    if (isDesktop) {
      setShowRight(true)
      return
    }
    setShowLeft(false)
    setShowRight(false)
  }, [isDesktop])

  return { isDesktop, showLeft, setShowLeft, showRight, setShowRight }
}
