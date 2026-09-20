'use client'

import * as React from 'react'
import { PixelFillButton } from '@/registry/components/spaceui/pixel-fill-button'
import { Button } from '@/registry/primitives/button'
import { tickSound } from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'

export default function Demo() {
  return (
    <div className="flex min-h-115 w-full flex-col items-center justify-center gap-8 p-6 sm:p-10">
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-8">
        <div className="flex w-full flex-col items-center gap-3">
          <span className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Liquid Metal Border Edition
          </span>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <PixelFillButton
              borderEffect="metal"
              metalPreset="chrome"
              pixelColor="#e2e8f0"
              textColorOnHover="#000000"
              size="default"
            >
              Liquid Chrome 🫧
            </PixelFillButton>

            <PixelFillButton
              borderEffect="metal"
              metalPreset="gold"
              pixelColor="#ffe9a8"
              textColorOnHover="#000000"
              size="default"
            >
              Liquid Gold 🏆
            </PixelFillButton>

            <PixelFillButton
              borderEffect="metal"
              metalPreset="violet"
              pixelColor="#c9a6ff"
              textColorOnHover="#000000"
              size="default"
            >
              Liquid Violet 🔮
            </PixelFillButton>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <span className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Classic Edition
          </span>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <PixelFillButton borderEffect="default" pixelColor="#ffe9a8" textColorOnHover="#000000" size="default">
              Space UI 🤯❣️
            </PixelFillButton>

            <PixelFillButton
              borderEffect="default"
              pixelColor="#93c5fd"
              textColorOnHover="#000000"
              variant="outline"
              size="default"
            >
              Explore Universe 🌌
            </PixelFillButton>

            <PixelFillButton borderEffect="default" pixelColor="#fdba74" textColorOnHover="#000000" size="default">
              Deploy Project 🚀
            </PixelFillButton>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <span className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Silk Border Edition
          </span>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <PixelFillButton
              borderEffect="silk"
              pixelColor="#c084fc"
              silkPreset="twilight"
              textColorOnHover="#ffffff"
              size="default"
            >
              Silk Twilight ✨
            </PixelFillButton>

            <PixelFillButton
              borderEffect="silk"
              silkPreset="aurora"
              pixelColor="#ec4899"
              textColorOnHover="#ffffff"

              size="default"
            >
              Silk Aurora 🌃
            </PixelFillButton>

            <PixelFillButton
              borderEffect="silk"
              silkPreset="sunset"
              pixelColor="#fb923c"
              textColorOnHover="#ffffff"

              size="default"
            >
              Silk Sunset 🌅
            </PixelFillButton>
          </div>
        </div>
      </div>
    </div>
  )
}
