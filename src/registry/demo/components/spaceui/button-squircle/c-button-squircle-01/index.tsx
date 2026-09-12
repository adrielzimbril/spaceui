'use client'

import * as React from 'react'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { IconArrowRight } from '@tabler/icons-react'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-8">
      <Button variant="primary">
        <span>Default Squircle</span>
      </Button>

      <Button variant="secondary">
        <span>Secondary</span>
      </Button>

      <Button variant="outline">
        <span>Outline</span>
      </Button>

      <Button variant="destructive">
        <span>Destructive</span>
      </Button>

      <Button variant="ghost">
        <span>Ghost</span>
      </Button>
    </div>
  )
}
