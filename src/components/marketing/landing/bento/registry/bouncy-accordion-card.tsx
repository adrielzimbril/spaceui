'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { BouncyAccordion } from '@/registry/components/spaceui/bouncy-accordion'

export function BouncyAccordionCard() {
  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex min-h-72 items-center justify-center rounded-lg">
          <div className="w-full">
            <BouncyAccordion
              items={[
                {
                  title: 'Base UI Primitives',
                  description: 'Accessible, unstyled headless component core.',
                },
                {
                  title: 'Spring Curves',
                  description: 'Calculated dynamically via Motion with zero linear easing.',
                },
                {
                  title: 'Zero Lock-in',
                  description: 'Drop the TypeScript file directly into your repository.',
                },
              ]}
            />
          </div>
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle>Bouncy Accordion</FrameTitle>
        <Link
          href="/components/bouncy-accordion"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
