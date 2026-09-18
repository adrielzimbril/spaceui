'use client'

import * as React from 'react'
import { NICE_PALETTES } from '@usespaceui/gradients'
import { ChromaPalette } from '@/registry/components/spaceui/chroma-palette'
import { TextMorph } from '@/registry/components/spaceui/morphing-text'

export interface ChromaPaletteDemoProps {
  count?: number
  corner?: number
}

export default function Demo({ count = 5, corner = 14 }: ChromaPaletteDemoProps) {
  const clampedCount = Math.min(5, Math.max(2, Number(count)))

  // Extract color arrays from NICE_PALETTES sliced to the specified count
  const palettes = React.useMemo(() => {
    return NICE_PALETTES.map((p) => p.colors.slice(0, clampedCount))
  }, [clampedCount])

  const [currentPaletteName, setCurrentPaletteName] = React.useState<string>(() => {
    return NICE_PALETTES[0]?.name ?? 'Sirius'
  })

  const handlePaletteChange = React.useCallback(
    (colors: string[]) => {
      // Find matching preset name if any
      const match = NICE_PALETTES.find((p) =>
        p.colors.slice(0, clampedCount).every((c, i) => c.toLowerCase() === colors[i]?.toLowerCase()),
      )
      if (match) {
        setCurrentPaletteName(match.name)
      }
    },
    [clampedCount],
  )

  return (
    <div className="flex flex-col items-center justify-center gap-[1rem] py-[1.5rem] px-[1rem]">
      <ChromaPalette
        count={clampedCount}
        corner={Number(corner)}
        palettes={palettes}
        onPaletteChange={handlePaletteChange}
      />
      {currentPaletteName && (
        <TextMorph className="text-[0.75rem] font-medium tracking-wide text-muted-foreground uppercase">
          {currentPaletteName}
        </TextMorph>
      )}
    </div>
  )
}
