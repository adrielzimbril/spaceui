'use client'

import React, { useState } from 'react'
import { useBundle } from '@/components/providers/bundle-provider'
import { useBrandColor } from '@/components/providers/brand-color-provider'
import { bloomSound, slideSound } from '@/components/providers/sound-provider'
import { InlineInstallBar } from '@/components/docs/installation/inline-install-bar'
import { Button } from '@/registry/primitives/button'
import { Badge } from '@/registry/primitives/badge'
import { Kbd } from '@/registry/primitives/kbd'
import { IconLogo } from '@/components/layout/icon-logo'
import {
  Drawer,
  DrawerTrigger,
  DrawerPopup,
  DrawerContent,
  DrawerHeader,
  DrawerPanel,
  DrawerFooter,
  DrawerClose,
  DrawerTitle,
} from '@/registry/primitives/drawer'
import { IconPackage, IconPackageExport, IconX, IconBox, IconShare, IconTrash } from '@tabler/icons-react'
import { useClipboard } from '@/registry/hooks/browser/use-clipboard'
import { cn } from '@/registry/lib/utils'
import { REGISTRY_NAMESPACE } from '@/lib/install-command'

export function BundleDrawer() {
  const { items, count, remove, clear, message } = useBundle()
  const { activePalette } = useBrandColor()
  const [open, setOpen] = useState(false)
  const { copy: copyShare, copied: copiedShare } = useClipboard({ timeout: 1500 })

  const shareUrl = React.useMemo(() => {
    if (typeof window === 'undefined' || items.length === 0) return ''
    const slugs = items.map((i) => i.slug).join(',')
    const themeParam = activePalette.name !== 'zinc' ? `&theme=${activePalette.name}` : ''
    return `${window.location.origin}/docs?bundle=${slugs}${themeParam}`
  }, [items, activePalette.name])

  const handleCopyShare = async () => {
    if (!shareUrl) return
    bloomSound()
    await copyShare(shareUrl)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={
          <Button
            variant="ghost"
            aria-label={`Open component bundle (${count} selected)`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg! px-2.5 h-8 bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer transition-all active:scale-[0.96]',
              count > 0 && 'bg-secondary border-4! border-background text-foreground font-semibold',
            )}
            onClick={() => {
              bloomSound()
            }}
          >
            <IconPackage className="size-3.5" />
            <span className="hidden sm:inline font-medium text-xs">Bundle</span>
            {count > 0 && (
              <Badge
                variant="secondary"
                square
                className="bg-background size-4.5 p-0 flex items-center justify-center text-foreground text-[10px] font-bold"
              >
                {count}
              </Badge>
            )}
          </Button>
        }
      />

      <span aria-live="polite" className="sr-only">
        {message}
      </span>

      <DrawerPopup
        showBar={true}
        className="bg-muted p-1 flex flex-col gap-2 h-full sm:max-w-2xl self-center place-self-center"
      >
        {/* Header — identical to MobileNavDrawer */}
        <DrawerHeader className="flex flex-col p-0!">
          <div className="shrink-0 flex flex-row gap-2 items-center justify-between px-3.5 py-2! bg-background rounded-xl">
            <div className="inline-flex items-center gap-2">
              <IconLogo size="sm" />
              <span className="text-sm font-semibold">Space UI</span>
              <Badge
                variant="outline"
                size="sm"
                className="rounded-sm text-[10px] uppercase tracking-wider text-muted-foreground ml-1"
              >
                Bundle ({count})
              </Badge>
            </div>

            <DrawerTitle className="sr-only">Install Bundle</DrawerTitle>

            <div className="flex items-center gap-1.5 ml-auto">
              <Kbd className="hidden sm:inline-flex">Esc</Kbd>
              <DrawerClose
                render={
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => bloomSound()}
                    className="size-8 rounded-lg cursor-pointer"
                  >
                    <IconX className="size-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                }
              />
            </div>
          </div>
        </DrawerHeader>

        {/* Content Area — matching MobileNavDrawer */}
        <DrawerContent className="flex-1 min-h-0 overflow-hidden bg-background rounded-xl">
          <DrawerPanel className="p-0 overflow-y-auto">
            <div className="py-2">
              {/* Selected Components Section */}
              <div>
                <div className="flex items-center justify-between px-4 py-1.5 text-xs font-medium tracking-wider text-muted-foreground">
                  <span>Selected Components</span>
                  <span className="text-[.6875rem] uppercase text-muted-foreground">
                    {count} {count <= 1 ? 'Item' : 'Items'}
                  </span>
                </div>

                {count === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <IconPackageExport className="size-5" />
                    </div>
                    <div className="text-sm font-medium text-foreground">Your bundle is empty</div>
                    <div className="text-xs text-muted-foreground max-w-xs">
                      Add components from documentation to build your bundle.
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 px-2">
                    {items.map((item) => (
                      <div
                        key={item.slug}
                        className="group/item flex w-full items-center justify-between rounded-lg px-3 py-1.5 transition-colors text-foreground hover:bg-muted group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IconBox className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate text-sm">{item.title}</span>
                        </div>
                        <Button
                          variant="secondary"
                          size="icon-sm"
                          onClick={() => {
                            slideSound('out')
                            remove(item.slug)
                          }}
                          className="text-muted-foreground group-hover/item:bg-background hover:bg-background cursor-pointer transition-colors"
                          title={`Remove ${item.title}`}
                        >
                          <IconX className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Installation Block */}
              {count > 0 && (
                <>
                  <div className="bg-border/70 mx-2 my-1.5 h-px" aria-hidden="true" />
                  <div className="px-2 pt-1">
                    <InlineInstallBar
                      packageName={items.map((i) => `${REGISTRY_NAMESPACE}/${i.slug}`).join(' ')}
                      isShadcn={true}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>
          </DrawerPanel>
        </DrawerContent>

        {/* Footer — mirrors MobileNavDrawer */}
        <DrawerFooter className="shrink-0 flex-row items-center justify-between! border-none px-0.5 pb-2 pt-0">
          <Button
            variant="secondary"
            onClick={handleCopyShare}
            className="flex h-8 gap-2 items-center justify-center bg-background rounded-md px-3 text-sm font-medium hover:bg-muted text-foreground cursor-pointer"
          >
            <IconShare className="size-3.5 text-muted-foreground" />
            <span>{copiedShare ? 'Copied link!' : 'Share bundle'}</span>
          </Button>
          {count > 0 && (
            <Button
              variant="secondary"
              onClick={() => {
                slideSound('out')
                clear()
              }}
              className="flex h-8 gap-2 items-center justify-center bg-background rounded-md px-3 text-sm font-medium hover:bg-muted text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <IconTrash className="size-3.5" />
              <span>Clear all</span>
            </Button>
          )}
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  )
}
