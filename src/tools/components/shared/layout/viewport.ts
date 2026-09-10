'use client'

import { useEffect, useState } from 'react'
import { useMediaQuery } from '@/registry/hooks/browser/use-media-query'

export function useResourceDesktop() {
  const [ready, setReady] = useState(false)
  const matches = useMediaQuery('(min-width: 768px)', true)

  useEffect(() => {
    setReady(true)
  }, [])

  return ready ? matches : true
}

export function useResourceSidebars(defaultLeft = false) {
  const isDesktop = useResourceDesktop()
  const [showLeft, setShowLeft] = useState(defaultLeft)
  const [showRight, setShowRight] = useState(true)

  useEffect(() => {
    if (isDesktop) {
      if (defaultLeft) setShowLeft(true)
      setShowRight(true)
      return
    }
    setShowLeft(false)
    setShowRight(false)
  }, [isDesktop, defaultLeft])

  return { isDesktop, showLeft, setShowLeft, showRight, setShowRight }
}
