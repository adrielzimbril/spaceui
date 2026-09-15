import type { ReactNode } from 'react'
import { OpenRunde } from '@/registry/lib/fonts/open-runde'
import { SiteFooter } from '@/components/layout/site-footer'
import { cn } from '@/registry/lib/utils'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        OpenRunde.variable,
        'font-open-runde!',
        '[--font-body:var(--font-open-runde),sans-serif]! [--font-heading:var(--font-open-runde),sans-serif]! [--font-sans:var(--font-open-runde),sans-serif]!',
        'min-h-screen flex flex-col bg-background text-foreground',
      )}
    >
      <main className="flex-1 w-full pt-24 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}
