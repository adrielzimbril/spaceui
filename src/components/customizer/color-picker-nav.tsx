'use client'

import React from 'react'
import { BRAND_PALETTES, useBrandColor } from '@/components/providers/brand-color-provider'
import { useUiSound } from '@/components/providers/sound-provider'
import { Popover, PopoverTrigger, PopoverPopup } from '@/registry/primitives/popover'
import { Button } from '@/registry/primitives/button'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { IconCheck, IconRotateClockwise } from '@tabler/icons-react'
import { usePathname } from 'next/navigation'
import { isMarketingRoute } from '@/config/preview-config'
import { cn } from '@/registry/lib/utils'

export function ColorPickerNav() {
  const { activePalette, setPalette, resetPalette } = useBrandColor()
  const { playSound } = useUiSound()
  const pathname = usePathname()
  const isMarketing = isMarketingRoute(pathname)

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Choose primary brand color"
            className={cn(
              'size-8 rounded-lg! bg-background data-pressed:bg-background text-muted-foreground hover:text-foreground cursor-pointer transition-colors overflow-hidden',
              isMarketing && 'hidden! opacity-0',
            )}
            onClick={() => playSound('bloom')}
          />
        }
      >
        <span
          className="size-4 rounded-sm border border-border/80 transition-colors"
          style={{ background: activePalette.previewGradient }}
        />
      </PopoverTrigger>

      <PopoverPopup
        side="top"
        align="center"
        sideOffset={8}
        className="rounded-2xl border-2 border-muted bg-muted p-1 shadow-2xl w-64 z-50 flex flex-col gap-1 text-popover-foreground outline-none **:data-[slot=popover-viewport]:p-0!"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground shrink-0">
              Theme Color
            </span>
            {/* <span className="text-xs font-semibold text-foreground truncate">({activePalette.label})</span> */}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              playSound('bloom')
              resetPalette()
            }}
            className="bg-background hover:bg-background border border-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer shrink-0 ml-2"
            title="Reset to default"
          >
            <IconRotateClockwise className="size-3" />
            <span>Reset</span>
          </Button>
        </div>

        {/* Content Wrapper with ScrollArea Component */}
        <div className="rounded-lg bg-background p-1.5 border border-muted/50">
          <ScrollArea className="h-56 w-full" scrollFade scrollbarGutter>
            <div className="p-1 grid grid-cols-4 gap-1.5">
              {BRAND_PALETTES.map((palette) => {
                const isActive = palette.name === activePalette.name
                const isDarkColor = ['zinc', 'violet', 'teal', 'pinkish-pink'].includes(palette.name)

                return (
                  <Button
                    key={palette.name}
                    variant="ghost"
                    aria-label="Choose primary brand color"
                    title={palette.label}
                    onClick={() => {
                      playSound('bloom')
                      setPalette(palette.name)
                    }}
                    className={cn(
                      'group relative flex flex-col h-full! items-center justify-center gap-1.5 p-1.5 rounded-md transition-all cursor-pointer outline-none hover:bg-muted/70',
                      isActive
                        ? 'bg-muted ring-1 ring-border font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span
                      className="size-7 rounded-lg border border-border/70 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
                      style={{ background: palette.primary }}
                    >
                      {isActive && (
                        <IconCheck
                          className={cn('size-3.5 stroke-[2.5]', isDarkColor ? 'text-white' : 'text-zinc-900')}
                        />
                      )}
                    </span>
                    <span className="text-[10px] font-medium leading-tight truncate w-full text-center">
                      {palette.label}
                    </span>
                  </Button>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </PopoverPopup>
    </Popover>
  )
}
