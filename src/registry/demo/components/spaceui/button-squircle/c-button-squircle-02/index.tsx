'use client'

import * as React from 'react'
import { Button } from '@/registry/components/spaceui/button-squircle'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-8">
      <Button size="xs" variant="secondary">
        <span>Extra Small</span>
      </Button>

      <Button size="sm" variant="secondary">
        <span>Small</span>
      </Button>

      <Button size="default">
        <span>Default</span>
      </Button>

      <Button size="lg">
        <span>Large</span>
      </Button>
    </div>
  )
}
