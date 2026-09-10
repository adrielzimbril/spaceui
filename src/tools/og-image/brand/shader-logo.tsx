'use client'

import { useEffect, useState } from 'react'
import { MeshGradient } from '@paper-design/shaders-react'

const PALETTE = ['#a8e6ff', '#5e7bff', '#101a4a', '#1a2a6b']

interface ShaderLogoProps {
  size?: number
  className?: string
  speed?: number
}

/** Small circular animated orb used as the Space UI brand mark. */
export function ShaderLogo({ size = 28, className = '', speed = 2.2 }: ShaderLogoProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from 210deg, ${PALETTE.join(', ')}, ${PALETTE[0]})`,
      }}
      aria-hidden="true"
    >
      {mounted ? (
        <MeshGradient
          style={{ width: '100%', height: '100%' }}
          colors={PALETTE}
          distortion={1}
          swirl={0.85}
          speed={speed}
        />
      ) : null}
    </span>
  )
}
