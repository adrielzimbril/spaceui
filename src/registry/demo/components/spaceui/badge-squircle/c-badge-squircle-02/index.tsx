'use client'

import * as React from 'react'
import { Badge } from '@/registry/components/spaceui/badge-squircle'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-8">
      <Badge size="xs" variant="secondary">
        <span>Extra Small</span>
      </Badge>

      <Badge size="sm" variant="secondary">
        <span>Small</span>
      </Badge>

      <Badge size="default">
        <span>Default</span>
      </Badge>

      <Badge size="md">
        <span>Medium</span>
      </Badge>

      <Badge size="lg">
        <span>Large</span>
      </Badge>
    </div>
  )
}
