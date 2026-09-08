'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export function DeferredMount({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const root = node.closest('[data-slot="scroll-area-viewport"]')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { root: root instanceof Element ? root : null, rootMargin: '320px 0px', threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex size-full items-center justify-center">
      {visible ? children : null}
    </div>
  )
}
