'use client'

import { Hero } from '@/components/marketing/landing/hero'
import { RegistryGrid } from '@/components/marketing/landing/registry-grid'
import { PackagesSection } from '@/components/marketing/landing/packages-section'
import { TestimonialsSection } from '@/components/marketing/landing/testimonials'
import { FinalCta } from '@/components/marketing/landing/final-cta'
import { SectionScrollspy } from '@/registry/components/spaceui/section-scrollspy'

export default function HomePage() {
  return (
    <main className="relative min-h-dvh bg-background text-foreground selection:bg-primary/20">
      {/* 1. Hero — Value proposition + CLI install bar */}
      <Hero />

      {/* 2. Registry Grid — Real components, interactive previews, and real counters */}
      <RegistryGrid />

      {/* 3. Packages — Independent @usespaceui/* packages & Creative Studio */}
      <PackagesSection />

      {/* 4. Social Proof — Loved by builders who ship */}
      <TestimonialsSection />

      {/* 5. Final CTA — Closing card with quick CLI and GitHub star */}
      <FinalCta />

      {/* Section Scrollspy */}
      <SectionScrollspy portal />
    </main>
  )
}
