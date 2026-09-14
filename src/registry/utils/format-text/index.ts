/**
 * Truncates text to a maximum length and adds ellipsis if needed
 *
 * @param text - The text to truncate
 * @param options - Configuration options
 * @param options.type - Type of truncation: 'char' for characters, 'word' for words (default: 'char')
 * @param options.maxLength - Maximum length before truncation (default: 40)
 *
 * @returns The truncated text with ellipsis if needed
 *
 * @example
 * truncateText("This is a very long text", { type: 'char', maxLength: 10 }) // returns "This is a..."
 * truncateText("This is a very long text", { type: 'word', maxLength: 3 }) // returns "This is a..."
 */
export function truncateText(text: string, options: { type?: 'char' | 'word'; maxLength?: number } = {}): string {
  const { type = 'char', maxLength = 40 } = options

  if (type === 'word') {
    const words = text.split(' ')
    if (words.length <= maxLength) return text
    return words.slice(0, maxLength).join(' ') + '...'
  }

  // Default: character-based truncation
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export interface RandomWordOptions {
  /**
   * Number of words to generate.
   *
   * @default 1
   */
  count?: number
  /**
   * Length (number of characters) of each word.
   * If omitted, a natural random length between 3 and 8 characters is used.
   */
  length?: number
  /**
   * Casing style of the output word(s).
   *
   * @default 'lowercase'
   */
  casing?: 'lowercase' | 'uppercase' | 'capitalize'
  /**
   * Separator when generating multiple words.
   *
   * @default ' '
   */
  separator?: string
  /**
   * If true, includes numbers inside the generated word(s).
   *
   * @default false
   */
  alphanumeric?: boolean
}

/**
 * Procedurally generates random pseudo-lorem words on the fly without any pre-defined word dictionary.
 * Alternates vowels and consonants to create natural-sounding pseudo-Latin words.
 *
 * @param options - Configuration options
 * @returns The generated random word(s)
 *
 * @example
 * randomWord() // e.g. "visota", "peluxo", "dorem"
 * randomWord({ count: 3 }) // e.g. "velita norisa panuto"
 * randomWord({ casing: 'capitalize' }) // e.g. "Falune"
 * randomWord({ length: 6, alphanumeric: true }) // e.g. "v3lora"
 */
export function randomWord(options: RandomWordOptions = {}): string {
  const { count = 1, length, casing = 'lowercase', separator = ' ', alphanumeric = false } = options

  const consonants = 'bcdfghjklmnpqrstvwxz'
  const vowels = 'aeiou'
  const digits = '0123456789'

  const generateSingleWord = (): string => {
    const targetLength = length ?? Math.floor(Math.random() * 6) + 3 // 3 to 8 chars
    let word = ''
    let isVowel = Math.random() > 0.5

    while (word.length < targetLength) {
      if (alphanumeric && Math.random() < 0.25) {
        word += digits[Math.floor(Math.random() * digits.length)]
      } else {
        const pool = isVowel ? vowels : consonants
        word += pool[Math.floor(Math.random() * pool.length)]
        isVowel = !isVowel
      }
    }

    return word.slice(0, targetLength)
  }

  const words: string[] = []
  for (let i = 0; i < count; i++) {
    const raw = generateSingleWord()
    let formatted = raw
    if (casing === 'uppercase') {
      formatted = raw.toUpperCase()
    } else if (casing === 'capitalize') {
      formatted = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
    } else {
      formatted = raw.toLowerCase()
    }
    words.push(formatted)
  }

  return words.join(separator)
}

export type CapitalizeMode = 'sentence' | 'words' | 'first'

export interface CapitalizeOptions {
  /**
   * Capitalization mode:
   * - `'sentence'`: Capitalizes the first letter of each sentence (after `.`, `!`, `?` or newline).
   * - `'words'`: Capitalizes the first letter of each word (title case).
   * - `'first'`: Capitalizes only the very first letter of the entire string.
   *
   * @default 'sentence'
   */
  mode?: CapitalizeMode
  /**
   * Whether to lowercase all other characters in the text.
   * When `true`, ensures that *only* the targeted first letters are uppercase.
   *
   * @default true
   */
  lowerRest?: boolean
}

/**
 * Capitalizes text according to the specified mode.
 * By default, only capitalizes the first letter of sentences and converts the rest to lowercase.
 *
 * @param text - The text string to format
 * @param options - Capitalization mode ('sentence' | 'words' | 'first') or configuration options
 * @returns The formatted string
 *
 * @example
 * // Sentence case (default):
 * capitalizeText("welcome to space ui. build faster interfaces!")
 * // => "Welcome to space ui. Build faster interfaces!"
 *
 * // Words case (first letter of each word):
 * capitalizeText("space ui component library", 'words')
 * // => "Space Ui Component Library"
 *
 * // Only the very first letter of the string:
 * capitalizeText("beautiful web designs. highly accessible.", 'first')
 * // => "Beautiful web designs. highly accessible."
 *
 * // Preserve existing uppercase letters in the rest of the text:
 * capitalizeText("space UI is the best UI library", { mode: 'sentence', lowerRest: false })
 * // => "Space UI is the best UI library"
 */
export function capitalizeText(text: string, options: CapitalizeMode | CapitalizeOptions = {}): string {
  if (!text || typeof text !== 'string') return text ?? ''

  const opts: CapitalizeOptions = typeof options === 'string' ? { mode: options } : options
  const { mode = 'sentence', lowerRest = true } = opts

  const str = lowerRest ? text.toLowerCase() : text

  if (mode === 'words') {
    return str.replace(/(^|[^\p{L}\p{N}])(\p{L})/gu, (match, prefix, char) => prefix + char.toUpperCase())
  }

  if (mode === 'first') {
    return str.replace(/^(\s*)(\p{L})/u, (match, space, char) => space + char.toUpperCase())
  }

  // Default: 'sentence'
  return str.replace(/(^|[.!?\n]\s*)(\p{L})/gu, (match, prefix, char) => prefix + char.toUpperCase())
}

/**
 * Alias for `capitalizeText`.
 */
export const capitalize = capitalizeText

/**
 * Shorthand to capitalize the first letter of every word in the text.
 *
 * @example
 * capitalizeWords("crafting modern web interfaces")
 * // => "Crafting Modern Web Interfaces"
 */
export function capitalizeWords(text: string, options: Omit<CapitalizeOptions, 'mode'> = {}): string {
  return capitalizeText(text, { ...options, mode: 'words' })
}

/**
 * Shorthand to capitalize only the very first letter of the entire text.
 *
 * @example
 * capitalizeFirst("explore our collection of components. get started today.")
 * // => "Explore our collection of components. get started today."
 */
export function capitalizeFirst(text: string, options: Omit<CapitalizeOptions, 'mode'> = {}): string {
  return capitalizeText(text, { ...options, mode: 'first' })
}
