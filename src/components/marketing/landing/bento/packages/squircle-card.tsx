'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { tickSound } from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'

function SquircleSwatchItem({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      onClick={() => tickSound()}
      onMouseEnter={() => tickSound()}
      className={cn('size-11 cursor-pointer select-none transition-all duration-300', className)}
      {...props}
    />
  )
}

export function SquircleCard() {
  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex items-center justify-center gap-3 p-3 min-h-44 rounded-lg">
          <SquircleSwatchItem className="squircle rounded-2xl hover:rounded-xl bg-primary" />
          <SquircleSwatchItem className="squircle rounded-lg hover:rounded-md bg-muted" />
          <SquircleSwatchItem className="squircle rounded-full hover:rounded-2xl bg-foreground" />
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">Squircle Smoothing</FrameTitle>
        <Link
          href="/docs/squircle"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
