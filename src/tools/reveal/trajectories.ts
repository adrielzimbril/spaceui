export type TrajectoryFn = (t: number) => { x: number; y: number }

export const TRAJECTORIES: TrajectoryFn[] = [
  (t) => ({
    x: t < 0.5 ? t * 2 : 2 - t * 2,
    y: 0.5 + 0.06 * Math.sin(t * Math.PI * 2),
  }),
  (t) => ({
    x: t < 0.5 ? t * 2 : 2 - t * 2,
    y: 0.5 + 0.3 * Math.sin(t * Math.PI * 6),
  }),
  (t) => {
    const a = t * Math.PI * 2
    const d = 1 + Math.sin(a) * Math.sin(a)
    return {
      x: 0.5 + (0.36 * Math.cos(a)) / d,
      y: 0.5 + (0.3 * Math.sin(a) * Math.cos(a)) / d,
    }
  },
  (t) => {
    const xt = t * 3
    const xi = xt % 1
    return {
      x: t,
      y: xi < 0.5 ? 0.18 + xi * 2 * 0.64 : 0.82 - (xi - 0.5) * 2 * 0.64,
    }
  },
  (t) => {
    const angle = t * Math.PI * 2 * 3
    const phase = t < 0.5 ? t * 2 : 1 - (t - 0.5) * 2
    const r = 0.4 * phase
    return {
      x: 0.5 + r * Math.cos(angle - Math.PI / 2),
      y: 0.5 + r * Math.sin(angle - Math.PI / 2),
    }
  },
  (t) => {
    const angle = t * Math.PI * 2 - Math.PI / 2
    const r = 0.29 + 0.115 * Math.cos(angle * 5)
    return { x: 0.5 + r * Math.cos(angle), y: 0.5 + r * Math.sin(angle) }
  },
]

export const TRAJECTORY_PERIODS = [4500, 5000, 4000, 4000, 6000, 4500]

export const TRAJECTORY_ICONS = [
  'M1 12 C5 8,9 8,14 12 C19 16,23 16,28 12',
  'M1 12 C4 7,7 7,10 12 C13 17,16 17,19 12 C22 7,25 7,28 12',
  'M14 12 C10 7,3 7,3 12 C3 17,10 17,14 12 C18 7,25 7,25 12 C25 17,18 17,14 12 Z',
  'M1 5 L8 19 L15 5 L22 19 L28 5',
  'M14 11.5 C16 9,19.5 9,20 12 C20.5 15,17 18,13.5 17.5 C9 17,7 13,8.5 9.5 C10 6,14 4,18 5.5 C23 7.5,25 13,23 18',
  'M14 2 L16 9 L23 9 L18 14 L20 21 L14 17 L8 21 L10 14 L5 9 L12 9 Z',
]
