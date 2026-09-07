'use client'

import type { AvatarEffect, AvatarVariant } from '@usespaceui/avatars'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { MockupGallery } from './mockups/MockupGallery'
import {
  playgroundMockupImages,
  dataList,
  dataTwitter,
  dataSuggested,
  dataShared,
  nameProfile,
  nameInstagram,
  nameUpload,
  nameUploadLikes,
} from './mock-data'

export function MockupView({
  pool,
  pattern,
  size,
  effect,
  animate,
  circle,
  parsedColors,
  paletteIndex,
}: {
  pool: string[]
  pattern: AvatarVariant | 'all'
  size: number
  effect: AvatarEffect
  animate: boolean
  circle: boolean
  parsedColors?: string[]
  paletteIndex: number
}) {
  const seed = pool[0] ?? 'Space UI'
  const colors = parsedColors ?? undefined

  return (
    <ScrollArea className="h-full w-full" data-lenis-prevent="true" scrollFade>
      <MockupGallery
        imgProfile={playgroundMockupImages.imgProfile}
        imgUpload={playgroundMockupImages.imgUpload}
        variant={pattern}
        colors={colors}
        nameProfile={nameProfile}
        nameInstagram={nameInstagram}
        nameUpload={nameUpload}
        nameUploadLikes={nameUploadLikes}
        dataList={dataList}
        dataTwitter={dataTwitter}
        dataSuggested={dataSuggested}
        dataShared={dataShared}
        circle={circle}
        effect={effect}
        animate={animate}
        seed={seed}
      />
    </ScrollArea>
  )
}
