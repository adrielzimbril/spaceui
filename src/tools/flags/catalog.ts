import countriesData from './data/countries.json'
import languagesData from './data/languages.json'
import manifestData from './data/manifest.json'
import type { CountryItem, FlagMetadata, FlagMode, LanguageItem } from './types'

export const COUNTRIES = countriesData as CountryItem[]
export const LANGUAGES = languagesData as LanguageItem[]

export const COUNTRY_CODES: string[] = manifestData.country_codes ?? COUNTRIES.map((c) => c.code)
export const LANGUAGE_CODES: string[] = manifestData.language_codes ?? LANGUAGES.map((l) => l.code)

export const DEFAULT_COUNTRY = 'ci'
export const DEFAULT_LANGUAGE = 'zh'

const countryMap = new Map<string, CountryItem>()
for (const item of COUNTRIES) {
  countryMap.set(item.code.toLowerCase(), item)
}

const languageMap = new Map<string, LanguageItem>()
for (const item of LANGUAGES) {
  languageMap.set(item.code.toLowerCase(), item)
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function getCountry(code: string): CountryItem | undefined {
  return countryMap.get(code.toLowerCase().trim())
}

export function getLanguage(code: string): LanguageItem | undefined {
  const norm = code.toLowerCase().trim()
  if (norm === 'cn') return languageMap.get('zh')
  return languageMap.get(norm)
}

export function getFlagMetadata(code: string, mode: FlagMode): FlagMetadata {
  const normCode = code.toLowerCase().trim()
  if (mode === 'language') {
    const langKey = normCode === 'cn' ? 'zh' : normCode
    const lang = languageMap.get(langKey)
    return {
      code: langKey,
      name: lang?.name ?? langKey.toUpperCase(),
      nameFr: lang?.name_fr,
      nativeName: lang?.native_name,
      mode: 'language',
    }
  }

  const country = countryMap.get(normCode)
  return {
    code: normCode,
    name: country?.name ?? normCode.toUpperCase(),
    nameFr: country?.name_fr,
    dialCode: country?.dial_code,
    emoji: country?.emoji,
    mode: 'country',
  }
}

export function matchesFlagQuery(code: string, mode: FlagMode, query: string): boolean {
  const q = normalize(query)
  if (!q) return true

  const normCode = code.toLowerCase().trim()
  const cleanQ = q.replace(/^[+#\s]+/, '')

  // 1. Direct code check
  if (normCode === q || normCode.startsWith(q) || normCode.replace(/-/g, '') === q) {
    return true
  }

  if (mode === 'language') {
    if ((q === 'cn' || q === 'china' || q === 'chine' || q === 'chinese' || q === 'chinois') && normCode === 'zh') {
      return true
    }
    const lang = languageMap.get(normCode)
    if (!lang) return false

    const name = normalize(lang.name)
    if (name.includes(q)) return true

    if (lang.name_fr && normalize(lang.name_fr).includes(q)) return true
    if (lang.native_name && normalize(lang.native_name).includes(q)) return true

    return false
  }

  // Country mode
  const country = countryMap.get(normCode)
  if (!country) return false

  // Emoji check
  if (country.emoji && (query.includes(country.emoji) || country.emoji.includes(query.trim()))) {
    return true
  }

  // Dial code check (e.g. +33 or 33)
  if (country.dial_code) {
    const dialClean = country.dial_code.replace(/[^0-9]/g, '')
    if (cleanQ && dialClean.startsWith(cleanQ)) return true
    if (country.dial_code.toLowerCase().includes(q)) return true
  }

  const name = normalize(country.name)
  if (name.includes(q)) return true

  if (country.name_fr && normalize(country.name_fr).includes(q)) return true

  return false
}

export function filterCatalog(mode: FlagMode, query: string): string[] {
  const codes = mode === 'country' ? COUNTRY_CODES : LANGUAGE_CODES
  const q = query.trim()
  if (!q) return codes

  return codes.filter((code) => matchesFlagQuery(code, mode, q))
}

export function randomFlag(mode: FlagMode, pool?: string[]): string {
  const list = pool && pool.length > 0 ? pool : mode === 'country' ? COUNTRY_CODES : LANGUAGE_CODES
  const index = Math.floor(Math.random() * list.length)
  return list[index] ?? (mode === 'country' ? DEFAULT_COUNTRY : DEFAULT_LANGUAGE)
}
