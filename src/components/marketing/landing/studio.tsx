'use client'

import { IconStack2, IconClick, IconPackage, IconCode } from '@tabler/icons-react'
import { BouncyAccordion } from '@/registry/components/spaceui/bouncy-accordion'
import { Surface } from './surface'

export function Studio() {
  return (
    <section data-page-section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Built like the docs.</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
            The same trays, springs, and orbs you install. This page is the kit, in the registry, and in your agent.
          </p>
        </div>
        <Surface innerClassName="p-3 sm:p-4">
          <BouncyAccordion
            items={[
              {
                icon: <IconStack2 className="size-4" />,
                title: 'Chrome is a tray',
                description: 'Muted well, 8px inset, inner panel at 14px radius. No hairline between the two fills.',
              },
              {
                icon: <IconClick className="size-4" />,
                title: 'One filled action',
                description: 'Carbon on light, snow on dark. Outline or ghost sits beside it. Never three fills.',
              },
              {
                icon: <IconPackage className="size-4" />,
                title: 'Registry, not a lock-in',
                description: 'shadcn add pulls a file into your tree. You own the source after install.',
              },
              {
                icon: <IconCode className="size-4" />,
                title: 'Type is Inter',
                description: 'Weight 500 in UI, 600 on titles. Geist Mono only for commands, kbd, and live numbers.',
              },
            ]}
          />
        </Surface>
      </div>
    </section>
  )
}
