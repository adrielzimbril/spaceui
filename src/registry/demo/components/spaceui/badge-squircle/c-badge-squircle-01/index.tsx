'use client'

import { Badge } from '@/registry/components/spaceui/badge-squircle'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-8">
      <Badge variant="default">
        <span>Default</span>
      </Badge>

      <Badge variant="primary">
        <span>Primary</span>
      </Badge>

      <Badge variant="secondary">
        <span>Secondary</span>
      </Badge>

      <Badge variant="outline">
        <span>Outline</span>
      </Badge>

      <Badge variant="accent">
        <span>Accent</span>
      </Badge>

      <Badge variant="destructive">
        <span>Destructive</span>
      </Badge>

      <Badge variant="inverted">
        <span>Inverted</span>
      </Badge>
    </div>
  )
}
