'use client'

import { useEffect, useRef } from 'react'

export function LottieEmoji({
  src,
  size = 40,
  alt,
  className,
}: {
  src: string
  size?: number
  alt?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    let cancelled = false
    let anim: { destroy: () => void; goToAndStop: (value: number, isFrame?: boolean) => void } | null = null

    const run = async () => {
      const [mod, response] = await Promise.all([import('lottie-web'), fetch(src)])
      if (cancelled || !ref.current) return
      if (!response.ok) return
      const animationData = await response.json()
      let lottie: any = mod
      while (lottie && typeof lottie.loadAnimation !== 'function') lottie = lottie.default
      if (!lottie) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      anim = lottie.loadAnimation({
        container: ref.current,
        renderer: 'svg',
        loop: !reduced,
        autoplay: !reduced,
        animationData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
          viewBoxOnly: true,
        },
      })
      const svg = ref.current.querySelector('svg')
      if (svg) {
        svg.removeAttribute('width')
        svg.removeAttribute('height')
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        svg.style.width = '100%'
        svg.style.height = '100%'
        svg.style.display = 'block'
      }
      if (reduced) anim.goToAndStop(0, true)
    }

    void run()

    return () => {
      cancelled = true
      anim?.destroy()
      node.replaceChildren()
    }
  }, [src])

  return (
    <div
      ref={ref}
      role="img"
      aria-label={alt}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        flex: 'none',
        overflow: 'hidden',
        lineHeight: 0,
      }}
    />
  )
}
