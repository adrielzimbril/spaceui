'use client'

import { cn } from '@/registry/lib/utils'
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteSeparator,
} from '@/registry/primitives/autocomplete'
import { Kbd } from '@/registry/primitives/kbd'
import { Dialog as CommandDialogPrimitive } from '@base-ui/react/dialog'
import { SearchIcon } from 'lucide-react'
import type * as React from 'react'

export const CommandDialog: typeof CommandDialogPrimitive.Root = CommandDialogPrimitive.Root

export const CommandDialogPortal: typeof CommandDialogPrimitive.Portal = CommandDialogPrimitive.Portal

export const CommandCreateHandle: typeof CommandDialogPrimitive.createHandle = CommandDialogPrimitive.createHandle

export function CommandDialogTrigger(props: CommandDialogPrimitive.Trigger.Props): React.ReactElement {
  return <CommandDialogPrimitive.Trigger data-slot="command-dialog-trigger" {...props} />
}

export function CommandDialogBackdrop({
  className,
  ...props
}: CommandDialogPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <CommandDialogPrimitive.Backdrop
      className={cn(
        'fixed inset-0 z-50 bg-black/10 backdrop-blur-sm transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0',
        className,
      )}
      data-slot="command-dialog-backdrop"
      {...props}
    />
  )
}

export function CommandDialogViewport({
  className,
  ...props
}: CommandDialogPrimitive.Viewport.Props): React.ReactElement {
  return (
    <CommandDialogPrimitive.Viewport
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center px-4 py-[max(--spacing(4),4vh)] sm:py-[10vh]',
        className,
      )}
      data-slot="command-dialog-viewport"
      {...props}
    />
  )
}

export function CommandDialogPopup({
  className,
  children,
  portalProps,
  ...props
}: CommandDialogPrimitive.Popup.Props & {
  portalProps?: CommandDialogPrimitive.Portal.Props
}): React.ReactElement {
  return (
    <CommandDialogPortal {...portalProps}>
      <CommandDialogBackdrop />
      <CommandDialogViewport>
        <CommandDialogPrimitive.Popup
          className={cn(
            'relative row-start-2 flex [corner-shape:superellipse(1.25)] border-4 border-background max-h-115 min-h-0 w-full min-w-0 max-w-xl translate-y-[calc(-1.25rem*var(--nested-dialogs))] scale-[calc(1-0.1*var(--nested-dialogs))] flex-col rounded-2xl bg-muted p-1 text-popover-foreground opacity-[calc(1-0.1*var(--nested-dialogs))] outline-none transition-[scale,opacity,translate] duration-200 ease-in-out will-change-transform data-nested:data-ending-style:translate-y-8 data-nested:data-starting-style:translate-y-8 data-nested-dialog-open:origin-top data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0 **:data-[slot=scroll-area-viewport]:data-has-overflow-y:pe-1',
            className,
          )}
          data-slot="command-dialog-popup"
          {...props}
        >
          <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden rounded-2xl">{children}</div>
        </CommandDialogPrimitive.Popup>
      </CommandDialogViewport>
    </CommandDialogPortal>
  )
}

export function Command({
  autoHighlight = 'always',
  keepHighlight = true,
  ...props
}: React.ComponentProps<typeof Autocomplete>): React.ReactElement {
  return <Autocomplete autoHighlight={autoHighlight} inline keepHighlight={keepHighlight} open {...props} />
}

export function CommandInput({
  className,
  placeholder = undefined,
  ...props
}: React.ComponentProps<typeof AutocompleteInput>): React.ReactElement {
  return (
    <div className="px-0.5 py-1.5" data-slot="command-input-wrapper">
      <AutocompleteInput
        autoFocus
        className={cn(
          'border-transparent! bg-background! rounded-xl py-0.5 shadow-none before:hidden has-focus-visible:ring-0 text-sm font-normal placeholder:text-muted-foreground/70 *:data-[slot=autocomplete-input]:ps-[calc(--spacing(12.5)-1px)] sm:*:data-[slot=autocomplete-input]:ps-[calc(--spacing(12)-1px)]',
          className,
        )}
        placeholder={placeholder}
        size="lg"
        startAddon={
          <span className="bg-muted aspect-square rounded-md px-2 py-0.5 inline-flex items-center justify-center">
            <SearchIcon className="size-4 text-muted-foreground shrink-0" />
          </span>
        }
        {...props}
      />
    </div>
  )
}

export function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteList>): React.ReactElement {
  return (
    <AutocompleteList
      className={cn('not-empty:scroll-py-2 not-empty:p-2', className)}
      data-slot="command-list"
      {...props}
    />
  )
}

export function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteEmpty>): React.ReactElement {
  return (
    <AutocompleteEmpty
      className={cn('not-empty:py-10 text-center text-sm font-medium text-muted-foreground', className)}
      data-slot="command-empty"
      {...props}
    />
  )
}

export function CommandPanel({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn(
        'relative min-h-0 flex-1 overflow-hidden rounded-xl bg-background **:data-[slot=scroll-area-scrollbar]:mt-2',
        className,
      )}
      data-slot="command-panel"
      {...props}
    />
  )
}

export function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteGroup>): React.ReactElement {
  return <AutocompleteGroup className={cn('[[role=group]+&]:mt-2.5', className)} data-slot="command-group" {...props} />
}

export function CommandGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteGroupLabel>): React.ReactElement {
  return (
    <AutocompleteGroupLabel
      className={cn(
        'px-3 py-2 text-xs font-semibold tracking-wider text-muted-foreground bg-background select-none',
        className,
      )}
      data-slot="command-group-label"
      {...props}
    />
  )
}

export const CommandCollection = AutocompleteCollection

export function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteItem>): React.ReactElement {
  return (
    <AutocompleteItem
      className={cn(
        'flex min-h-9 cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted/40 data-highlighted:bg-muted data-highlighted:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      data-slot="command-item"
      {...props}
    />
  )
}

export function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteSeparator>): React.ReactElement {
  return <AutocompleteSeparator className={cn('my-2', className)} data-slot="command-separator" {...props} />
}

export function CommandShortcut({ className, ...props }: React.ComponentProps<'kbd'>): React.ReactElement {
  return <Kbd className={cn(className)} data-slot="command-shortcut" {...props} />
}

export function CommandFooter({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 border-t border-muted bg-muted/70 px-3 py-3 text-xs text-muted-foreground rounded-b-2xl **:data-[slot=kbd-group]:bg-background **:data-[slot=kbd-group]:rounded-md **:data-[slot=kbd-group]:p-0.5 [&_[data-slot=kbd]:not([data-slot=kbd-group]_*)]:bg-background',
        className,
      )}
      data-slot="command-footer"
      {...props}
    />
  )
}

export { CommandDialogPrimitive }
