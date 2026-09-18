'use client'

import * as React from 'react'
import { IconRectangle, IconSquare, IconRectangleVertical } from '@tabler/icons-react'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'
import { MorphingArea, MORPHING_AREA_OPTIONS } from '@/registry/components/spaceui/morphing-area'
import { getOptimizedImageUrl } from '@/registry/lib/next-image-url'
import { imagelib } from '@/lib/imagelib'

export interface MorphingAreaDemoProps {
  rounded?: number
  morph?: number
  squircle?: boolean
}

const imageSrc = getOptimizedImageUrl(imagelib.tools.imagesplit[0].url, { width: 552 })

export default function Demo({ rounded = 8, morph = 50, squircle = false }: MorphingAreaDemoProps) {
  const [activeRatio, setActiveRatio] = React.useState<'land' | 'square' | 'tall'>('square')

  const currentOption = MORPHING_AREA_OPTIONS.find((opt) => opt.id === activeRatio) ?? MORPHING_AREA_OPTIONS[1]

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-6 px-4 select-none font-sans">
      {/* Equal-Area Morphing Stage */}
      <div className="w-[17.25rem] h-[17.25rem] flex items-center justify-center overflow-hidden">
        <MorphingArea
          ratio={currentOption.ratio}
          rounded={Number(rounded)}
          morph={Number(morph)}
          squircle={Boolean(squircle)}
        >
          <img
            src={imageSrc}
            alt="Morphing visual demo"
            className="size-full object-cover select-none pointer-events-none"
          />
        </MorphingArea>
      </div>

      {/* Tabs ratio selector using Space UI Tabs primitive and Tabler icons */}
      <Tabs value={activeRatio} onValueChange={(val) => setActiveRatio(val as 'land' | 'square' | 'tall')}>
        <TabsList className="p-1 rounded-xl">
          <TabsTab
            value="land"
            data-space-hover
            data-space-click
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
          >
            <IconRectangle className="size-3.5" strokeWidth={2} />
          </TabsTab>
          <TabsTab
            value="square"
            data-space-hover
            data-space-click
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
          >
            <IconSquare className="size-3.5" strokeWidth={2} />
          </TabsTab>
          <TabsTab
            value="tall"
            data-space-hover
            data-space-click
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
          >
            <IconRectangleVertical className="size-3.5" strokeWidth={2} />
          </TabsTab>
        </TabsList>
      </Tabs>
    </div>
  )
}
