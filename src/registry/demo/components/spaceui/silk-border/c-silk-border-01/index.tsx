'use client'

import { SilkBorder } from '@/registry/components/spaceui/silk-border'
import { Avatar } from '@/registry/primitives/avatar'
import { AvatarFallback } from '@/registry/components/spaceui/avatar-extended'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-6">
      <SilkBorder preset="pro" className="inline-flex size-16 rounded-full p-0.75">
        <Avatar className="size-full">
          <AvatarFallback name="space" variant="pebble" />
        </Avatar>
      </SilkBorder>

      <SilkBorder preset="ocean" className="inline-flex size-16 rounded-full p-0.75">
        <Avatar className="size-full">
          <AvatarFallback name="galaxy" variant="mesh" />
        </Avatar>
      </SilkBorder>

      <SilkBorder preset="community" className="inline-flex size-16 rounded-full p-0.75">
        <Avatar className="size-full">
          <AvatarFallback name="starlight" variant="doodle" />
        </Avatar>
      </SilkBorder>
    </div>
  )
}
