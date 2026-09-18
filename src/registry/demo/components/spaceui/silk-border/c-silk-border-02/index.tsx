'use client'

import { SilkBorder } from '@/registry/components/spaceui/silk-border'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Badge } from '@/registry/components/spaceui/badge-squircle'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-6">
      <SilkBorder preset="lifetime" className="inline-flex squircle rounded-full p-0.75 shadow-sm">
        <Button variant="primary">Explore Pro Silk</Button>
      </SilkBorder>

      <SilkBorder preset="sunset" className="inline-flex squircle rounded-full p-0.75">
        <Badge size="sm" variant="primary" className="select-none">
          SUNSET EDITION
        </Badge>
      </SilkBorder>

      <SilkBorder preset="emerald" className="inline-flex squircle rounded-full p-0.75">
        <Badge size="sm" variant="secondary" className="select-none">
          SYSTEM ACTIVE
        </Badge>
      </SilkBorder>
    </div>
  )
}
