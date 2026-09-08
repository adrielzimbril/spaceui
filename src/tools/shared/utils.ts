import { PERSONAS } from './seeds'

export function shufflePersonas(): string[] {
  const copy = [...PERSONAS]
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1))
    const current = copy[index]!
    copy[index] = copy[swap]!
    copy[swap] = current
  }
  return copy
}

export function getRandomPersonas(count: number): string[] {
  return shufflePersonas().slice(0, Math.max(1, count))
}

export const toLabel = (value: string) =>
  value.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
