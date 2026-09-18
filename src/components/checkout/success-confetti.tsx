'use client'

import * as React from 'react'
import confetti from 'canvas-confetti'

const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#f43f5e']

export function SuccessConfetti() {
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    confetti({
      particleCount: 120,
      spread: 90,
      startVelocity: 40,
      origin: { y: 0.3 },
      colors: COLORS,
    })

    const timeout = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 110,
        startVelocity: 25,
        origin: { y: 0.4 },
        colors: COLORS,
      })
    }, 200)

    return () => clearTimeout(timeout)
  }, [])

  return null
}
