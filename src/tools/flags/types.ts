export type FlagShape = 'circle' | 'square' | '4x3'

export type FlagMode = 'country' | 'language'

export interface CountryItem {
  code: string
  name: string
  name_fr?: string
  dial_code?: string
  emoji?: string
}

export interface LanguageItem {
  code: string
  name: string
  name_fr?: string
  native_name?: string
}

export interface FlagMetadata {
  code: string
  name: string
  nameFr?: string
  nativeName?: string
  dialCode?: string
  emoji?: string
  mode: FlagMode
}

export const FLAG_SHAPES: { value: FlagShape; label: string; aspect: string }[] = [
  { value: 'circle', label: 'Circle', aspect: '1:1' },
  { value: 'square', label: 'Square', aspect: '1:1' },
  { value: '4x3', label: 'Rect (4:3)', aspect: '4:3' },
]

export const FLAG_MODES: { value: FlagMode; label: string; count: number }[] = [
  { value: 'country', label: 'Flags', count: 429 },
  { value: 'language', label: 'Languages', count: 201 },
]
