'use client'

import { SilkFlare } from '@/registry/components/shader/silk-flare'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { GooeySlotsTooltip } from '@/registry/components/spaceui/gooey-slots-tooltip'
import { IconInfoCircle } from '@tabler/icons-react'

export default function Demo() {
  return (
    <div className="flex size-full items-end justify-center">
      <GooeySlotsTooltip trigger={<IconInfoCircle className="size-5" />}>
        <div className="relative dark flex h-full w-full flex-col justify-end pb-6">
          <div className="squircle absolute top-0 left-0 h-33 w-full overflow-hidden rounded-t-4xl">
            <SilkFlare
              color1="#6a68ee"
              color2="#c9a6ff"
              color3="#04106c"
              color1Opacity={1}
              color2Opacity={1}
              color3Opacity={1}
              animate
              speed={1.5}
              grain
            />
          </div>
          <div className="mt-33 px-6">
            <h6 className="mt-6 mb-2 flex flex-wrap items-center text-xl font-semibold tracking-tight whitespace-nowrap">
              Fully slottable
              <Badge variant="warning" size="xs" className="ml-2">
                New
              </Badge>
            </h6>
            <p className="mb-2 text-xs leading-[160%] whitespace-nowrap opacity-60">
              Drop shaders, badges, your own JSX <br />
              straight into the bubble—zero detaching
            </p>
          </div>
        </div>
      </GooeySlotsTooltip>
    </div>
  )
}
