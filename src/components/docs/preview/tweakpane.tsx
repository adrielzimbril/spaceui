'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useDragControls } from 'motion/react'
import { Label } from '@/registry/primitives/label'
import { Slider } from '@/registry/primitives/slider'
import { TickSlider } from '@/registry/components/spaceui/tick-slider'
import { Input } from '@/registry/primitives/input'
import { cn } from '@/registry/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/primitives/collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { Switch } from '@/registry/primitives/switch'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { TabsPrimitive } from '@/registry/primitives/tabs'
import { IconAdjustments, IconChevronDown, IconX, IconUpload } from '@tabler/icons-react'
import { Button } from '@/registry/primitives/button'

// ... Keep types ...
type BindFile = { type: 'file'; value: string; accept?: string; dependsOn?: Record<string, unknown> }
type BaseBindNumber = { value: number; dependsOn?: Record<string, unknown> }
type BindNumberSlider = BaseBindNumber & { min: number; max: number; step: number }
type BindNumberOptions = BaseBindNumber & { options: Record<string, number> }
type BindNumber = BindNumberSlider | BindNumberOptions | BaseBindNumber
type BindString = {
  value: string
  options?: Record<string, string>
  dependsOn?: Record<string, unknown>
  label?: string
}
type BindOptions = {
  value: string | number | boolean
  options: Record<string, string | number | boolean>
  dependsOn?: Record<string, unknown>
  label?: string
}
type BindBoolean = { value: boolean; dependsOn?: Record<string, unknown>; label?: string }
type Bind = BindNumber | BindString | BindBoolean | BindOptions | BindFile
type FlatBinds = Record<string, Bind>
type NestedBinds = Record<string, FlatBinds>
type Binds = FlatBinds | NestedBinds

interface ControlledTweakpaneProps {
  binds: Binds
  onBindsChange?: (binds: Binds) => void
}
interface UncontrolledTweakpaneProps {
  initialBinds: Binds
  onBindsChange?: (binds: Binds) => void
}

type TweakpaneProps = (ControlledTweakpaneProps | UncontrolledTweakpaneProps) & {
  show: boolean
  onClose: () => void
  portal?: boolean
  className?: string
}

interface NumericInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onValueChange,
  className,
  min,
  max,
  step = 1,
  ...props
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(value.toString())
  React.useEffect(() => {
    setInternalValue(value.toString())
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInternalValue(val)
    const num = Number.parseFloat(val)
    if (!Number.isNaN(num)) onValueChange(num)
  }

  const handleBlur = () => {
    let num = Number.parseFloat(internalValue)
    if (Number.isNaN(num)) {
      num = value
    } else {
      if (min !== undefined) num = Math.max(min, num)
      if (max !== undefined) num = Math.min(max, num)
    }
    setInternalValue(num.toString())
    onValueChange(num)
  }

  return (
    <Input
      type="number"
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur}
      step={step}
      min={min}
      max={max}
      className={cn('bg-muted/50 border-none', className)}
      {...props}
    />
  )
}

function isNestedBinds(binds: Binds): binds is NestedBinds {
  return (
    typeof binds === 'object' &&
    binds !== null &&
    Object.values(binds).every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        !('value' in item) &&
        Object.values(item).every((inner) => typeof inner === 'object' && inner !== null && 'value' in inner),
    )
  )
}

function countVisibleBinds(binds: Binds): number {
  if (isNestedBinds(binds)) {
    return Object.values(binds).reduce((total, group) => total + countVisibleBinds(group), 0)
  }
  return Object.values(binds).filter((bind) => {
    if ('dependsOn' in bind && (bind as any).dependsOn) {
      const deps = (bind as any).dependsOn as Record<string, unknown>
      return Object.entries(deps).every(([depKey, depVal]) => {
        const currentVal = (binds[depKey] as any)?.value
        if (Array.isArray(depVal)) return depVal.includes(currentVal)
        return currentVal === depVal
      })
    }
    return true
  }).length
}

function panelHeightClass(binds: Binds): string {
  const count = countVisibleBinds(binds)
  if (count <= 1) return 'h-26'
  if (count <= 2) return 'h-52'
  if (count <= 3) return 'h-64'
  if (count <= 4) return 'h-72'
  if (count <= 5) return 'h-86'
  if (count <= 6) return 'h-100'
  if (count <= 7) return 'h-114'
  return 'h-135'
}

function ControlLabel({ children, value }: { children: React.ReactNode; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[0.8125rem] font-[450] text-foreground leading-5">{children}</span>
      {value !== undefined && (
        <span className="text-xs text-muted-foreground leading-5 tabular-nums whitespace-nowrap">{value}</span>
      )}
    </div>
  )
}

const toLabel = (key: string) => key.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const renderNumber = (key: string, bind: BindNumber, onChange: (value: number) => void) => {
  return 'min' in bind && 'max' in bind ? (
    <div key={key} className="flex flex-col gap-2">
      <ControlLabel value={bind.value}>{toLabel(key)}</ControlLabel>
      <TickSlider
        min={bind.min}
        max={bind.max}
        step={bind.step}
        value={bind.value}
        onChange={onChange}
        label={toLabel(key)}
        showValue={false}
        className="w-full shadow-none bg-muted px-2.5 h-8"
      />
    </div>
  ) : 'options' in bind ? (
    <div key={key} className="flex flex-col gap-2">
      <ControlLabel>{toLabel(key)}</ControlLabel>
      <Select value={bind.value.toString()} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger id={key} className="h-9 w-full rounded-lg border-0 bg-muted px-3 text-xs">
          <span className="flex-1 truncate">
            {Object.entries(bind.options).find(([, v]) => v === bind.value)?.[0] ?? bind.value}
          </span>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(bind.options).map(([optKey, optVal]) => (
            <SelectItem className="text-xs" key={optKey} value={optVal.toString()}>
              {optKey}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : (
    <div key={key} className="flex flex-col gap-2">
      <ControlLabel>{toLabel(key)}</ControlLabel>
      <NumericInput
        id={key}
        value={bind.value}
        onValueChange={onChange}
        className="py-0.75 w-full rounded-lg border-0 bg-muted text-xs"
      />
    </div>
  )
}

function OptionsTabs({
  options,
  value,
  onChange,
}: {
  id: string
  options: Record<string, any>
  value: any
  onChange: (value: any) => void
}) {
  const entries = Object.entries(options)
  const currentKey = entries.find(([, v]) => v === value || String(v) === String(value))?.[0] ?? entries[0]?.[0]

  return (
    <TabsPrimitive.Root
      value={currentKey}
      onValueChange={(key) => {
        onChange(options[key] ?? key)
      }}
      className="w-full"
    >
      <TabsPrimitive.List className="relative flex items-center bg-muted p-0.5 font-medium w-full rounded-lg">
        {entries.map(([label]) => (
          <TabsPrimitive.Tab
            key={label}
            value={label}
            className="relative flex-1 z-10 px-2.5 py-1.5 text-[.6875rem] font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-background rounded-sm shrink-0 data-disabled:pointer-events-none data-disabled:opacity-30 text-center"
          >
            {label}
          </TabsPrimitive.Tab>
        ))}
        <TabsPrimitive.Indicator className="absolute bottom-0 left-0 -z-1 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-(--active-tab-bottom) rounded-lg bg-background transition-[width,translate] duration-200 ease-[cubic-bezier(0.2,0.9,0.4,1)]" />
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  )
}

const renderString = (key: string, bind: BindString, onChange: (value: string | number | boolean) => void) => {
  if (bind?.options) {
    const optEntries = Object.entries(bind.options)
    const wantsSelect =
      key.toLowerCase() === 'flow' ||
      (bind as any).type === 'select' ||
      (bind as any).control === 'select' ||
      (bind as any).view === 'select' ||
      (bind as any).asSelect === true
    const wantsTabs = (bind as any).type === 'tabs' || (bind as any).control === 'tabs' || (bind as any).view === 'tabs'

    if (!wantsSelect && (wantsTabs || optEntries.length <= 4)) {
      return (
        <div key={key} className="flex flex-col gap-2">
          <ControlLabel>{bind.label ?? toLabel(key)}</ControlLabel>
          <OptionsTabs id={key} options={bind.options} value={bind.value} onChange={onChange} />
        </div>
      )
    }

    return (
      <div key={key} className="flex flex-col gap-2">
        <ControlLabel>{bind.label ?? toLabel(key)}</ControlLabel>
        <Select
          value={String(bind.value)}
          onValueChange={(v) => {
            if (v === null) return
            const realValue = Object.values(bind.options ?? {}).find((opt) => String(opt) === v)
            onChange(realValue ?? v)
          }}
        >
          <SelectTrigger id={key} className="h-9 w-full rounded-lg border-0 bg-muted px-3 text-xs">
            <span className="flex-1 truncate">
              {Object.entries(bind.options ?? {}).find(([, v]) => String(v) === String(bind.value))?.[0] ?? bind.value}
            </span>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(bind.options).map(([optKey, optVal]) => (
              <SelectItem className="text-xs" key={optKey} value={String(optVal)}>
                {optKey}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div key={key} className="flex flex-col gap-2">
      <ControlLabel>{toLabel(key)}</ControlLabel>
      <div className="flex items-center gap-2">
        {typeof bind.value === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(bind.value) && (
          <input
            type="color"
            value={bind.value.slice(0, 7)}
            onChange={(e) => onChange(e.target.value)}
            className="size-8 cursor-pointer shrink-0 rounded-lg border border-border/50 bg-transparent p-0.5"
          />
        )}
        <Input
          id={key}
          value={bind.value}
          onChange={(e) => onChange(e.target.value)}
          className="py-0.75 w-full rounded-lg border-0 bg-muted text-xs"
        />
      </div>
    </div>
  )
}

function BooleanTabs({
  value,
  onChange,
  labels = ['Off', 'On'],
}: {
  id: string
  value: boolean
  onChange: (value: boolean) => void
  labels?: [string, string]
}) {
  return (
    <TabsPrimitive.Root
      value={value ? 'on' : 'off'}
      onValueChange={(val) => {
        onChange(val === 'on')
      }}
      className="w-full"
    >
      <TabsPrimitive.List className="relative flex items-center bg-muted p-0.5 font-medium w-full rounded-lg">
        {[
          { id: 'off', label: labels[0] },
          { id: 'on', label: labels[1] },
        ].map((opt) => (
          <TabsPrimitive.Tab
            key={opt.id}
            value={opt.id}
            className="relative flex-1 z-10 px-2.5 py-1.5 text-[.6875rem] font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-background rounded-sm shrink-0 data-disabled:pointer-events-none data-disabled:opacity-30 text-center"
          >
            {opt.label}
          </TabsPrimitive.Tab>
        ))}
        <TabsPrimitive.Indicator className="absolute bottom-0 left-0 -z-1 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-(--active-tab-bottom) rounded-lg bg-background transition-[width,translate] duration-200 ease-[cubic-bezier(0.2,0.9,0.4,1)]" />
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  )
}

const renderBoolean = (key: string, bind: BindBoolean, onChange: (value: boolean) => void) => {
  const labels: [string, string] =
    (bind as any).labels ?? ((bind as any).options ? Object.keys((bind as any).options) : ['Off', 'On'])
  return (
    <div key={key} className="flex min-w-0 flex-col gap-2">
      <ControlLabel>{(bind as any).label ?? toLabel(key)}</ControlLabel>
      <BooleanTabs id={key} value={bind.value} onChange={onChange} labels={labels} />
    </div>
  )
}

function FileInputControl({ id, bind, onChange }: { id: string; bind: BindFile; onChange: (value: string) => void }) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  return (
    <div className="flex flex-col gap-2">
      <ControlLabel>{toLabel(id)}</ControlLabel>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 justify-start gap-2 h-9 text-xs font-normal border-dashed border-border/80 bg-muted/40 hover:bg-muted"
          >
            <IconUpload className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{bind.value ? 'Change file...' : 'Choose file...'}</span>
          </Button>
          <input
            ref={fileInputRef}
            id={id}
            type="file"
            accept={bind.accept}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const objectUrl = URL.createObjectURL(file)
                onChange(objectUrl)
              }
            }}
          />
          {bind.value && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                onChange('')
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
              title="Remove file"
              aria-label="Remove file"
            >
              <IconX className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

const renderFileInput = (key: string, bind: BindFile, onChange: (value: string) => void) => (
  <FileInputControl key={key} id={key} bind={bind} onChange={onChange} />
)

const renderBind = (key: string, bind: Bind, onChange: (value: unknown) => void) => {
  if ('type' in bind && bind.type === 'file') {
    return renderFileInput(key, bind as BindFile, onChange as (v: string) => void)
  }
  if ('value' in bind) {
    if ('options' in bind) {
      if (typeof bind.value === 'number') return renderNumber(key, bind as unknown as BindNumber, onChange)
      return renderString(key, bind as unknown as BindString, (v) => onChange(v))
    }
    if (typeof bind.value === 'number') return renderNumber(key, bind as BindNumber, onChange)
    if (typeof bind.value === 'string') return renderString(key, bind as BindString, onChange)
    if (typeof bind.value === 'boolean') return renderBoolean(key, bind as BindBoolean, onChange)
  }
  return null
}

const renderFlatBinds = (binds: FlatBinds, onBindsChange: (binds: FlatBinds) => void) => (
  <div className="flex flex-col gap-4">
    {Object.entries(binds).map(([key, bind]) => {
      if ('dependsOn' in bind && (bind as any).dependsOn) {
        const deps = (bind as any).dependsOn as Record<string, unknown>
        const matches = Object.entries(deps).every(([depKey, depVal]) => {
          const currentVal = (binds[depKey] as any)?.value
          if (Array.isArray(depVal)) return depVal.includes(currentVal)
          return currentVal === depVal
        })
        if (!matches) return null
      }

      return (
        <React.Fragment key={key}>
          {renderBind(key, bind, (value) => onBindsChange({ ...binds, [key]: { ...bind, value } } as FlatBinds))}
        </React.Fragment>
      )
    })}
  </div>
)

const renderNestedBinds = (binds: NestedBinds, onBindsChange: (binds: NestedBinds) => void) =>
  Object.entries(binds).map(([groupKey, groupBind]) => (
    <Collapsible key={groupKey} defaultOpen className="flex flex-col gap-3 rounded-xl bg-background p-2">
      <CollapsibleTrigger className="cursor-pointer w-full flex items-center justify-between rounded-xl px-2 py-2.5 bg-muted text-left">
        <span className="text-xs font-semibold text-foreground capitalize">{groupKey.replace(/[-_]/g, ' ')}</span>
        <IconChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="relative">
          {renderFlatBinds(groupBind, (updatedGroupBind) => onBindsChange({ ...binds, [groupKey]: updatedGroupBind }))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  ))

const renderBinds = (binds: Binds, onBindsChange: (binds: Binds) => void) =>
  isNestedBinds(binds)
    ? renderNestedBinds(binds, onBindsChange as (b: NestedBinds) => void)
    : renderFlatBinds(binds, onBindsChange as (b: FlatBinds) => void)

const Tweakpane = ({ show, onClose, onBindsChange, portal = true, className, ...props }: TweakpaneProps) => {
  const [localBinds, setLocalBinds] = React.useState<Binds>('binds' in props ? props.binds : props.initialBinds)
  const panelDragControls = useDragControls()
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const handleBindsChange = React.useCallback(
    (binds: Binds) => {
      setLocalBinds(binds)
      onBindsChange?.(binds)
    },
    [onBindsChange],
  )

  React.useEffect(() => {
    if ('binds' in props) setLocalBinds(props.binds)
  }, [props])

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const content = (
    <div
      ref={viewportRef}
      className={cn('pointer-events-none z-30', portal ? 'fixed inset-0' : 'absolute inset-0 overflow-hidden')}
    >
      <AnimatePresence initial={false}>
        {show && (
          <motion.aside
            drag
            dragListener={false}
            dragControls={panelDragControls}
            dragConstraints={viewportRef}
            dragElastic={0.04}
            dragMomentum={false}
            initial={{ opacity: 0, y: 8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.985 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            data-preview-ui
            aria-label="Component configuration"
            className={cn(
              'pointer-events-auto absolute bottom-6 right-6 flex flex-col [corner-shape:superellipse(1.25)] rounded-2xl bg-muted p-1.5 overscroll-none',
              portal
                ? 'max-h-[calc(100dvh-6.5rem)] w-[min(18rem,calc(100vw-2rem))]'
                : 'max-h-[calc(100%-3rem)] w-[min(18rem,calc(100%-2rem))]',
              className,
            )}
          >
            <div className={cn('relative flex flex-col', panelHeightClass(localBinds))}>
              <div
                onPointerDown={(e) => panelDragControls.start(e)}
                className="flex h-10 cursor-grab touch-none select-none items-center justify-between gap-3 rounded-lg bg-background px-3 active:cursor-grabbing"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <IconAdjustments aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 items-baseline gap-2">
                    <h3 className="truncate text-sm font-semibold">Configuration</h3>
                    <span className="truncate text-[0.625rem] text-muted-foreground">Properties</span>
                  </div>
                </div>
                <Button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={onClose}
                  aria-label="Close configuration"
                  variant="secondary"
                  size="icon-xs"
                >
                  <IconX aria-hidden="true" className="size-3.5" />
                </Button>
              </div>
              <ScrollArea
                className={cn('relative mt-1.5', !isNestedBinds(localBinds) && 'rounded-xl bg-background p-2')}
              >
                <div className="relative flex flex-col gap-2">{renderBinds(localBinds, handleBindsChange)}</div>
              </ScrollArea>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )

  if (!portal) {
    return content
  }

  return createPortal(content, document.body)
}

export { Tweakpane, type TweakpaneProps, type Binds }
