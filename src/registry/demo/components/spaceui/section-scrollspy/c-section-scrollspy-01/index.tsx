'use client'

import * as React from 'react'
import { SectionScrollspy } from '@/registry/components/spaceui/section-scrollspy'
import { Badge } from '@/registry/primitives/badge'

const SECTIONS = [
  { title: 'Section 01', badge: '01' },
  { title: 'Section 02', badge: '02' },
  { title: 'Section 03', badge: '03' },
  { title: 'Section 04', badge: '04' },
  { title: 'Section 05', badge: '05' },
  { title: 'Section 06', badge: '06' },
  { title: 'Section 07', badge: '07' },
  { title: 'Section 08', badge: '08' },
  { title: 'Section 09', badge: '09' },
  { title: 'Section 10', badge: '10' },
  { title: 'Section 11', badge: '11' },
  { title: 'Section 12', badge: '12' },
  { title: 'Section 13', badge: '13' },
  { title: 'Section 14', badge: '14' },
  { title: 'Section 15', badge: '15' },
  { title: 'Section 16', badge: '16' },
  { title: 'Section 17', badge: '17' },
  { title: 'Section 18', badge: '18' },
  { title: 'Section 19', badge: '19' },
  { title: 'Section 20', badge: '20' },
  { title: 'Section 21', badge: '21' },
  { title: 'Section 22', badge: '22' },
  { title: 'Section 23', badge: '23' },
  { title: 'Section 24', badge: '24' },
  { title: 'Section 25', badge: '25' },
  { title: 'Section 26', badge: '26' },
  { title: 'Section 27', badge: '27' },
  { title: 'Section 28', badge: '28' },
  { title: 'Section 29', badge: '29' },
  { title: 'Section 30', badge: '30' },
]

export default function Demo() {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  return (
    <div className="relative w-full overflow-hidden rounded-[0.875rem] bg-background">
      <div ref={scrollRef} className="h-full max-h-[60dvh] overflow-y-auto p-5 pb-28">
        {SECTIONS.map((section) => (
          <section key={section.title} data-page-section className="mb-8 space-y-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              {section.title}
              <Badge variant="secondary">{section.badge}</Badge>
            </h2>
            <div className="h-40 rounded-2xl bg-muted" />
          </section>
        ))}
      </div>
      <SectionScrollspy containerRef={scrollRef} />
    </div>
  )
}
