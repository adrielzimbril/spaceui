'use client'

import React from 'react'
import { bloomSound } from '@/components/providers/sound-provider'
import { usePackageManager, type PackageManager } from '@/components/providers/package-manager-provider'
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectItem } from '@/registry/primitives/select'
import { CopyButton } from '@/registry/components/spaceui/copy'
import { getShadcnAddCommands, getPackageInstallCommands, REGISTRY_NAMESPACE } from '@/lib/install-command'
import { cn } from '@/registry/lib/utils'
import { ScrollArea } from '@/registry/primitives/scroll-area'

const MANAGERS: { id: PackageManager; name: string }[] = [
  { id: 'pnpm', name: 'pnpm' },
  { id: 'npm', name: 'npm' },
  { id: 'yarn', name: 'yarn' },
  { id: 'bun', name: 'bun' },
]

export interface InlineInstallBarProps extends React.HTMLAttributes<HTMLDivElement> {
  packageName?: string
  isShadcn?: boolean
  commandOverride?: string | Partial<Record<PackageManager, string>>
}

function ShikiBashCode({ command }: { command: string }) {
  if (!command) return null

  const parts = command.split(' ').filter(Boolean)

  return (
    <code className="select-all text-[.8125rem] whitespace-nowrap">
      <span className="line">
        {parts.map((part, index) => {
          const isFirst = index === 0
          const text = isFirst ? part : ` ${part}`

          return (
            <span
              key={index}
              style={
                {
                  '--shiki-light': isFirst ? '#6F42C1' : '#032F62',
                  '--shiki-dark': isFirst ? '#B392F0' : '#9ECBFF',
                } as React.CSSProperties
              }
              className={isFirst ? 'text-[#6F42C1] dark:text-[#B392F0]' : 'text-[#032F62] dark:text-[#9ECBFF]'}
            >
              {text}
            </span>
          )
        })}
      </span>
    </code>
  )
}

export function InlineInstallBar({
  packageName,
  isShadcn: explicitIsShadcn,
  commandOverride,
  className,
  ...props
}: InlineInstallBarProps) {
  const [manager, setManager] = usePackageManager()

  const rawPkg = packageName || `${REGISTRY_NAMESPACE}/ui`
  const isShadcn =
    explicitIsShadcn ??
    (rawPkg.startsWith(`${REGISTRY_NAMESPACE}/`) ||
      rawPkg.startsWith('components-') ||
      rawPkg.startsWith('primitives-') ||
      rawPkg.startsWith('icons-') ||
      rawPkg.startsWith('hooks-') ||
      rawPkg.startsWith('p-') ||
      rawPkg.startsWith('c-'))

  const commands = isShadcn ? getShadcnAddCommands(rawPkg) : getPackageInstallCommands(rawPkg)

  const command =
    (typeof commandOverride === 'string' ? commandOverride : commandOverride?.[manager]) ||
    commands[manager] ||
    commands.npm

  return (
    <div
      className={cn('flex min-w-0 rounded-xl bg-background p-1 shadow-xs border border-border/40', className)}
      {...props}
    >
      <div className="flex h-10 w-full min-w-0 items-center gap-2 rounded-lg bg-muted px-1.5 pe-2.5">
        <Select
          value={manager}
          onValueChange={(val) => {
            if (val) {
              bloomSound()
              setManager(val as PackageManager)
            }
          }}
        >
          <SelectTrigger
            aria-label="Package manager"
            className="h-8 min-h-8 w-fit min-w-0 rounded-md border-0 bg-background px-2.5 text-[0.6875rem] font-medium text-foreground cursor-pointer justify-center"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectPopup showIcon={false} className="rounded-lg min-w-28">
            {MANAGERS.map((item) => (
              <SelectItem key={item.id} value={item.id} className="text-xs">
                {item.name}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>

        <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />
        <div className="relative min-w-0 flex-1 h-fit flex items-center overflow-hidden">
          <ScrollArea
            clampContentMinWidth={false}
            scrollbarGutter={false}
            scrollFade
            overscrollContain
            showScrollbar={false}
            className="size-full flex items-center"
          >
            <div className="w-max flex items-center h-full py-1">
              <ShikiBashCode command={command} />
            </div>
          </ScrollArea>
        </div>
        <CopyButton
          content={command}
          variant="ghost"
          size="xs"
          className="size-7 shrink-0 rounded-md bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-200"
        />
      </div>
    </div>
  )
}
