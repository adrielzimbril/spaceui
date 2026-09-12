'use client'

import * as React from 'react'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { IconArrowUpRight, IconHeartFilled, IconPlus, IconSend } from '@tabler/icons-react'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-8">
      <Button size="icon-xs" variant="secondary" aria-label="Add">
        <IconPlus className="size-3.5" />
      </Button>

      <Button size="icon-sm" variant="outline" aria-label="Like">
        <IconHeartFilled className="size-4 text-rose-500" />
      </Button>

      <Button size="icon" variant="secondary" aria-label="Action">
        <IconSend className="size-4" />
      </Button>

      <Button size="icon-lg" variant="primary" aria-label="Submit">
        <IconArrowUpRight className="size-5" />
      </Button>
    </div>
  )
}
