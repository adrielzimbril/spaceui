'use client'

import NumberFlow from '@number-flow/react'
import { Card, CardPanel } from '@/registry/primitives/card'
import { useInView } from '@/registry/hooks/animation/use-in-view'

export function AnimatedStat({ label, value }: { label: string; value: number }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.4 })

  return (
    <Card ref={ref} className="squircle items-center rounded-3xl bg-card/40 p-5 text-center">
      <CardPanel className="items-center gap-1 p-0">
        <span className="flex items-baseline gap-0.5 font-bold text-3xl text-foreground tabular-nums">
          <NumberFlow value={inView ? value : 0} />
          <span>+</span>
        </span>
        <span className="text-muted-foreground text-xs">{label}</span>
      </CardPanel>
    </Card>
  )
}
