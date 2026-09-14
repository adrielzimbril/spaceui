'use client'

import * as React from 'react'
import { useInView } from '@/registry/hooks/animation/use-in-view'
import { PlushCard } from '@/components/marketing/landing/bento/packages/plush-card'
import { AvatarsSquishmojiCard } from '@/components/marketing/landing/bento/packages/avatars-squishmoji-card'
import { FlagsCard } from '@/components/marketing/landing/bento/packages/flags-card'
import { SquircleCard } from '@/components/marketing/landing/bento/packages/squircle-card'
import { ImageSplitCard } from '@/components/marketing/landing/bento/packages/image-split-card'
import { EmojiCard } from '@/components/marketing/landing/bento/packages/emoji-card'
import { AudioCard } from '@/components/marketing/landing/bento/packages/audio-card'

export function ToolsBentoGrid() {
  const [ref, isVisible] = useInView({ threshold: 0.05, rootMargin: '150px', initialInView: true })
  const [hasBeenVisible, setHasBeenVisible] = React.useState(true)

  React.useEffect(() => {
    if (isVisible) {
      setHasBeenVisible(true)
    }
  }, [isVisible])

  return (
    <div ref={ref} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <PlushCard isVisible={isVisible} hasBeenVisible={hasBeenVisible} />
      <AvatarsSquishmojiCard isVisible={isVisible} />
      <FlagsCard isVisible={isVisible} />
      <AudioCard />
      <ImageSplitCard isVisible={isVisible} />
      <EmojiCard isVisible={isVisible} />
      <SquircleCard />
    </div>
  )
}
