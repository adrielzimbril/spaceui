import type { ReactNode } from 'react'
import { OpenRunde } from '@/registry/lib/fonts/open-runde'
import { SiteFooter } from '@/components/layout/site-footer'
import { GradualBlur } from '@/components/marketing/shared/gradual-blur'
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
      <SiteFooter />
      <GradualBlur />
    </div>
  )
}
