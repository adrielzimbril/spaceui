'use client'

import { AvatarFamily, getFamilyVariants, type AvatarVariant } from '@usespaceui/avatars'
import { Avatar } from '@usespaceui/avatars/react'
import { generatePalette, PRESET_PALETTES } from '@usespaceui/gradients'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/primitives/select'
import { toLabel } from './utils'

export type AvatarFamilyValue = AvatarVariant | 'all'

const AVATAR_FAMILY_GROUPS = Object.values(AvatarFamily).map((family) => ({
  label: toLabel(family),
  styles: getFamilyVariants(family),
}))

function OptionAvatar({ seed, variant, colors }: { seed: string; variant: AvatarFamilyValue; colors?: string[] }) {
  return (
    <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-muted">
      <Avatar name={seed} variant={variant === 'all' ? 'triton' : variant} colors={colors} size={24} circle />
    </span>
  )
}

export function AvatarVariantSelect({
  value,
  onChange,
  seed = 'family-preview',
  colors,
}: {
  value: AvatarFamilyValue
  onChange: (value: AvatarFamilyValue) => void
  seed?: string
  colors?: string[]
}) {
  return (
    <Select value={value} onValueChange={(next) => next && onChange(next as AvatarFamilyValue)}>
      <SelectTrigger aria-label="Avatar family" className="h-10 border-0 bg-muted px-2.5 text-xs">
        <SelectValue>
          <span className="flex min-w-0 items-center gap-2">
            <OptionAvatar seed={seed} variant={value} colors={colors} />
            <span className="truncate">{value === 'all' ? 'All families' : toLabel(value)}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" label="All families">
          <span className="flex items-center gap-2">
            <OptionAvatar seed={seed} variant="all" colors={colors} />
            All families
          </span>
        </SelectItem>
        {AVATAR_FAMILY_GROUPS.map(({ label, styles }) => (
          <SelectGroup key={label}>
            <SelectGroupLabel>{label === 'Paletteless' ? 'Illustrations' : label}</SelectGroupLabel>
            {styles.map((variant) => (
              <SelectItem key={variant} value={variant} label={toLabel(variant)}>
                <span className="flex items-center gap-2">
                  <OptionAvatar seed={`${seed}-${variant}`} variant={variant} colors={colors} />
                  {toLabel(variant)}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

function PaletteSwatches({ colors }: { colors: string[] }) {
  return (
    <span className="flex shrink-0 items-center -space-x-1">
      {colors.slice(0, 5).map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="size-5 rounded-full border border-background"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  )
}

function paletteColors(value: string, seed: string, customColors?: string[]) {
  if (value === '-2') return generatePalette(seed + Math.abs(seed.length)).colors
  if (value === '-1') return customColors ?? generatePalette(seed).colors
  return PRESET_PALETTES[Number(value)]?.colors ?? generatePalette(seed).colors
}

export function PaletteSelect({
  value,
  onChange,
  seed = 'palette-preview',
  customColors,
}: {
  value: string
  onChange: (value: string) => void
  seed?: string
  customColors?: string[]
}) {
  const defaultColors = customColors?.length !== 5 ? generatePalette(seed).colors : customColors
  const activeColors = paletteColors(value, seed, defaultColors)
  const activeLabel =
    value === '-2'
      ? 'Seeded / automatic'
      : value === '-1'
        ? 'Custom colors'
        : (PRESET_PALETTES[Number(value)]?.name ?? 'Palette')

  return (
    <Select value={value} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger aria-label="Color palette" className="h-10 border-0 bg-muted px-2.5 text-xs">
        <span className="flex min-w-0 items-center gap-2">
          <PaletteSwatches colors={value === '-1' ? defaultColors : activeColors} />
          <span className="truncate">{activeLabel}</span>
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="-2" label="Seeded / automatic">
          <span className="flex items-center gap-2">
            <PaletteSwatches colors={activeColors} />
            Seeded / automatic
          </span>
        </SelectItem>
        <SelectItem value="-1" label="Custom colors">
          <span className="flex items-center gap-2">
            <PaletteSwatches colors={defaultColors} />
            Custom colors
          </span>
        </SelectItem>
        {PRESET_PALETTES.map((palette, index) => (
          <SelectItem key={palette.name} value={String(index)} label={palette.name}>
            <span className="flex items-center gap-2">
              <PaletteSwatches colors={palette.colors} />
              {palette.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
