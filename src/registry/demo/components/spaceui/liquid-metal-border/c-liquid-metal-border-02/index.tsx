'use client'

import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'
import { Button } from '@/registry/components/spaceui/button-squircle'

export default function Demo() {
  return (
    <LiquidBorder className="inline-flex squircle rounded-full p-0.75">
      <Button variant="primary">Click me</Button>
    </LiquidBorder>
  )
}
