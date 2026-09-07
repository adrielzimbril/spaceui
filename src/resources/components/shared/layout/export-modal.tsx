'use client'

import type { ReactNode } from 'react'
import { IconDownload, IconX } from '@tabler/icons-react'
import { bloomSound, slideSound } from '@/components/providers/sound-provider'
import { DynamicCodeBlock } from '@/components/docs/code/dynamic-codeblock'
import { CopyButton } from '@/registry/components/spaceui/copy'
import { Button } from '@/registry/primitives/button'
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from '@/registry/primitives/drawer'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'
import { cn } from '@/registry/lib/utils'
import { useResourceDesktop } from '@/resources/components/shared/layout/viewport'

export type ExportFormat = 'svg' | 'png' | 'webp' | 'apng'

export function ResourceExportModal({
  open,
  onClose,
  description,
  title,
  subtitle,
  preview,
  meta,
  tabs,
  tab,
  onTabChange,
  code,
  lang,
  extraTabAction,
  exportFormat,
  onExportFormatChange,
  onDownload,
  formats = ['png', 'webp', 'svg'],
}: {
  open: boolean
  onClose: () => void
  description: string
  title: string
  subtitle?: ReactNode
  preview: ReactNode
  meta: ReactNode
  tabs: { id: string; label: string }[]
  tab: string
  onTabChange: (tab: string) => void
  code: string
  lang: string
  extraTabAction?: ReactNode
  exportFormat: ExportFormat
  onExportFormatChange: (format: ExportFormat) => void
  onDownload: () => void
  formats?: ExportFormat[]
}) {
  const isDesktop = useResourceDesktop()

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          slideSound()
          onClose()
        }
      }}
      position={isDesktop ? 'right' : 'bottom'}
    >
      <DrawerPopup
        className={cn(
          'max-w-lg border-none bg-muted p-2! shadow-none before:shadow-none dark:before:shadow-none',
          !isDesktop && 'pt-8',
        )}
        variant="inset"
        showBar={!isDesktop}
      >
        <DrawerHeader className="rounded-2xl bg-background px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <DrawerDescription className="text-xs font-medium uppercase tracking-tight">
                {description}
              </DrawerDescription>
              <DrawerTitle className="mt-1 truncate text-lg tracking-tight">
                {title} {subtitle}
              </DrawerTitle>
            </div>
            <DrawerClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close"
                  className="size-10 shrink-0 rounded-xl bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
                />
              }
            >
              <IconX className="size-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <DrawerPanel className="px-1 pt-2">
          <div className="grid gap-1.5 lg:grid-cols-[1fr_10rem]">
            <div className="flex min-h-60 items-center justify-center rounded-2xl bg-background p-8">{preview}</div>
            <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">{meta}</div>
          </div>

          <section className="mt-1.5 rounded-2xl bg-background p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-[0.625rem] font-medium uppercase tracking-tight text-muted-foreground">Export</h3>
              <span className="text-[0.6875rem] text-muted-foreground">
                {formats.includes('apng') ? 'PNG, APNG, WebP or SVG' : 'SVG, PNG or WebP'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Select
                value={exportFormat}
                onValueChange={(value) => value && onExportFormatChange(value as ExportFormat)}
              >
                <SelectTrigger className="min-w-full rounded-xl border-none bg-muted uppercase">
                  <SelectValue placeholder={exportFormat.toUpperCase()} />
                </SelectTrigger>
                <SelectPopup>
                  {formats.map((item) => (
                    <SelectItem key={item} value={item} label={item.toUpperCase()}>
                      {item.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
              <Button
                variant="secondary"
                aria-label={`Download ${exportFormat}`}
                className="h-9 rounded-xl bg-muted uppercase"
                onClick={onDownload}
              >
                <IconDownload className="size-4" /> Download
              </Button>
            </div>
          </section>

          <section className="mt-1.5 rounded-2xl bg-background p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <Tabs value={tab} onValueChange={onTabChange}>
                <TabsList aria-label="Code format" size="sm" className="w-full sm:w-auto">
                  {tabs.map((item) => (
                    <TabsTab key={item.id} value={item.id}>
                      {item.label}
                    </TabsTab>
                  ))}
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-1.5">
                {extraTabAction}
                <CopyButton
                  content={code}
                  variant="ghost"
                  size="sm"
                  aria-label="Copy code"
                  className="size-8 rounded-xl bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => bloomSound()}
                />
              </div>
            </div>
            <DynamicCodeBlock code={code} lang={lang} allowCopy={false} className="my-0" />
          </section>
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  )
}
