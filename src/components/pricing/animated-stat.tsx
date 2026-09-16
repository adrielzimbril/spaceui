'use client'

import NumberFlow from '@number-flow/react'
import { useInView } from '@/registry/hooks/animation/use-in-view'

export function AnimatedStat({ label, value }: { label: string; value: number }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.4 })

  return (
    <div ref={ref} className="rounded-2xl bg-muted p-6 sm:p-8">
      <p className="flex items-baseline gap-0.5 font-semibold text-4xl text-foreground tracking-tight tabular-nums">
        <NumberFlow value={inView ? value : 0} />
        <span>+</span>
      </p>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  )
}
