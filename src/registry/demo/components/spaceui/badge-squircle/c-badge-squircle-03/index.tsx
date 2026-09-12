'use client'

import * as React from 'react'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { IconArrowUpRight, IconEyeFilled, IconSparkles } from '@tabler/icons-react'

export default function Demo() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 max-w-md mx-auto">
      {/* Icons & Media Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Badge variant="default">
          <IconSparkles className="size-3 text-amber-500" />
          <span>Featured</span>
        </Badge>

        <Badge variant="secondary">
          <IconSparkles className="size-3 text-primary" />
          <span>New Release</span>
        </Badge>

        <Badge variant="inverted">
          <IconEyeFilled className="size-3.5" />
          <span>14.2k views</span>
        </Badge>
      </div>

      {/* Polymorphic Render as Interactive Link */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Badge
          variant="outline"
          render={<a href="#explore" className="cursor-pointer hover:border-foreground/30 transition-colors" />}
        >
          <span>Explore Docs</span>
          <IconArrowUpRight className="size-3" />
        </Badge>

        <Badge
          variant="accent"
          render={
            <button
              type="button"
              onClick={() => alert('Clicked Badge Button!')}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            />
          }
        >
          <span>Clickable Action</span>
        </Badge>
      </div>
    </div>
  )
}
