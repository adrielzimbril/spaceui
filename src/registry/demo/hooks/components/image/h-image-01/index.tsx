'use client'

import * as React from 'react'
import { Image } from '@/registry/hooks/components/image'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Badge } from '@/registry/primitives/badge'
import { IconPhoto } from '@tabler/icons-react'

export default function Demo() {
  return (
    <Card className="w-full max-w-md bg-muted rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 pt-1 pb-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Badge variant="secondary" className="rounded-sm aspect-square h-full! bg-transparent">
            <IconPhoto className="size-4 text-muted-foreground" />
          </Badge>
          <span>Image</span>
        </div>
        <Badge variant="outline" size="sm">
          Fallback
        </Badge>
      </div>
      <CardPanel className="flex flex-col gap-3 rounded-[0.875rem] bg-background p-3">
        <div className="overflow-hidden rounded-lg bg-muted">
          <span className="block px-2.5 pt-2 text-[.6875rem] font-semibold text-muted-foreground">Valid</span>
          <Image
            src="https://cdn.spaceui.one/atom/samples/image-1.png"
            fallback="https://placehold.co/400x120/1a1a2e/ffffff?text=Fallback+Image"
            alt="Space UI Banner"
            className="mt-1.5 h-24 w-full object-cover"
          />
        </div>
        <div className="overflow-hidden rounded-lg bg-muted">
          <span className="block px-2.5 pt-2 text-[.6875rem] font-semibold text-muted-foreground">Broken</span>
          <Image
            src="https://broken-url-that-does-not-exist.xyz/image.png"
            fallback="https://placehold.co/400x120/262626/ffffff?text=Broken+Source+Fallback"
            alt="Broken image fallback"
            className="mt-1.5 h-20 w-full object-cover"
          />
        </div>
      </CardPanel>
    </Card>
  )
}
