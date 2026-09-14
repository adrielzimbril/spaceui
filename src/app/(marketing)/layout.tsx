import type { ReactNode } from 'react'
import { OpenRunde } from '@/registry/lib/fonts/open-runde'
import { cn } from '@/registry/lib/utils'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        OpenRunde.variable,
        'font-open-runde!',
        '[--font-body:var(--font-open-runde),sans-serif]! [--font-heading:var(--font-open-runde),sans-serif]! [--font-sans:var(--font-open-runde),sans-serif]!',
      )}
    >
      {children}
    </div>
  )
}
