'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'

export interface HeaderSectionProps {
  title?: string
  description?: string
  emoji?: string
  className?: string
}

export default function HeaderSection({
  title = 'Metrics & Performance 📊',
  description = 'Transparency, growth and evolution of my creative universe ✨',
  emoji = '📊',
  className = '',
}: HeaderSectionProps) {
  return (
    <section className={cn('relative w-full py-14 md:py-[104px]', className)}>
      <div className="w-full bg-muted rounded-3xl overflow-hidden border-0">
        <div className="px-6 md:px-12 py-16 md:py-20">
          <div className="flex flex-col items-center justify-between gap-6 max-w-full md:flex-row md:gap-16">
            <div className="row-1 relative flex items-center justify-center size-fit md:size-[40%] aspect-square cursor-pointer transition-transform duration-300 hover:scale-105 md:order-2 bg-background rounded-full p-8 md:p-12">
              <span className="relative size-full flex items-center justify-center text-8xl md:text-9xl pointer-events-none select-none">
                {emoji}
              </span>
            </div>
            <div className="row-2 flex flex-col gap-6 items-start justify-start relative md:max-w-full flex-1">
              <h1 className="relative text-4xl md:text-5xl font-extrabold leading-[1.1] whitespace-pre-line tracking-tight text-foreground">
                {title}
              </h1>
              <p className="relative text-xl md:text-2xl text-muted-foreground whitespace-pre-line leading-relaxed font-medium">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
