export interface InteractionRecorderItem {
  name: string
  shortName: string
  title: string
  description: string
  categories: string[]
}

export type InteractionGroup = { value: string; items: InteractionRecorderItem[] }

/** Base canvas height anchor — the interaction is centered into it, never stretched to fill it.
 * Width is derived from this via the aspect ratio (BASE_CANVAS_SIZE * aspectRatio). */
export const BASE_CANVAS_SIZE = 1080

/** Output scale multiplier: scales the canvas AND the element together (internal scale, not a crop/stretch). */
export const SCALES = [
  { value: 1, label: '1× Standard' },
  { value: 2, label: '2× Retina HD' },
  { value: 3, label: '3× Ultra HD' },
] as const

export type ScaleValue = (typeof SCALES)[number]['value']

/** Canvas aspect ratio — width is BASE_CANVAS_SIZE * ratio, height stays BASE_CANVAS_SIZE. */
export const ASPECT_RATIOS = [
  { value: 1, label: '1:1' },
  { value: 4 / 3, label: '4:3' },
  { value: 16 / 9, label: '16:9' },
] as const

export type AspectRatioValue = (typeof ASPECT_RATIOS)[number]['value']
