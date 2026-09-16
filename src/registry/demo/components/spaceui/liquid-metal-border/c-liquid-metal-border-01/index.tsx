'use client'

import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'
import { Avatar } from '@/registry/primitives/avatar'
import { AvatarFallback } from '@/registry/components/spaceui/avatar-extended'

export default function Demo() {
  return (
    <LiquidBorder className="inline-flex size-14 rounded-full p-0.75">
      <Avatar className="size-full">
        <AvatarFallback name="space" variant="pebble" />
      </Avatar>
    </LiquidBorder>
  )
}
