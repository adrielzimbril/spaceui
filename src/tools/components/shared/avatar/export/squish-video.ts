import {
  renderLayout,
  resolveExpression,
  resolveShape,
  SquishEngine,
  type SquishBackgroundStyleChoice,
  type SquishExpressionChoice,
  type SquishLayout,
  type SquishShapeChoice,
} from '@usespaceui/squishmoji'
import { pngsToApng } from './apng'
import { imageFor, save } from './raster'
import { WebmMuxer } from './webm'

export type MotionFormat = 'webm' | 'apng'

export interface SequenceStep {
  id: string
  shape: SquishShapeChoice
  expression: SquishExpressionChoice
  durationSec: number
  backgroundStyle: SquishBackgroundStyleChoice
  seed: string
  blink: boolean
  wobble: boolean
  animate: boolean
}

const FPS = 30

function adjusted(
  engine: SquishEngine,
  time: number,
  duration: number,
  eyeY: number,
  split: number,
  scale: number,
  gaze: number,
  forceBlink = false,
  timeInStep = 0,
  animate = true,
) {
  const phaseX = animate ? Math.sin((time * Math.PI * 2) / duration) * 0.8 : 0
  const phaseY = animate ? Math.cos((time * Math.PI * 4) / duration) * 0.8 : 0
  const blinkPhase = (time + 1.35) % 4.7
  const autoLid = !animate || blinkPhase > 0.18 ? 1 : Math.max(0.035, Math.abs(blinkPhase / 0.09 - 1))
  let manualLid = 1
  if (forceBlink) {
    const blinkProgress = Math.min(1, Math.max(0, (timeInStep - 0.5) / 0.2))
    manualLid = blinkProgress < 1 ? Math.max(0.035, Math.abs(blinkProgress * 2 - 1)) : 1
  }
  const lid = Math.min(autoLid, manualLid)
  return engine.layout(time, (eyes) =>
    eyes.map((eye, index) => {
      const matrix = [...eye.matrix] as typeof eye.matrix
      const pairCenterX = (eyes[0]!.matrix[4] + eyes[1]!.matrix[4]) / 2
      const pairCenterY = (eyes[0]!.matrix[5] + eyes[1]!.matrix[5]) / 2
      const gazeFactor = 0.35 + gaze * 0.65
      matrix[4] = pairCenterX + (matrix[4] - pairCenterX) * gazeFactor
      matrix[5] = pairCenterY + (matrix[5] - pairCenterY) * gazeFactor
      matrix[4] += phaseX * 16 * gaze + (index === 0 ? -split : split)
      matrix[5] += 10 - phaseY * 13 * gaze + eyeY
      matrix[3] *= lid
      return { ...eye, width: eye.width * scale, height: eye.height * scale, matrix }
    }),
  )
}

const FRAME_US = 1_000_000 / FPS

const WEBM_PRESETS: { codec: string; mux: string }[] = [
  { codec: 'vp8', mux: 'V_VP8' },
  { codec: 'vp09.00.10.08', mux: 'V_VP9' },
  { codec: 'vp09.00.20.08', mux: 'V_VP9' },
]

async function createEncoder(
  width: number,
  height: number,
  output: EncodedVideoChunkOutputCallback,
  presets: { codec: string; mux?: string }[],
  muxCodec?: { value: string },
) {
  const bitrate = Math.min(6_000_000, Math.max(1_500_000, Math.floor((width * height) / 2)))
  for (const preset of presets) {
    const base = { codec: preset.codec, width, height, bitrate, framerate: FPS }
    const variants: VideoEncoderConfig[] = [
      { ...base, hardwareAcceleration: 'no-preference' },
      { ...base, hardwareAcceleration: 'prefer-software' },
      base,
    ]
    for (const config of variants) {
      try {
        const support = await VideoEncoder.isConfigSupported(config)
        if (!support.supported) continue
        const encoder = new VideoEncoder({
          output,
          error: () => {},
        })
        encoder.configure(support.config ?? config)
        if (muxCodec && preset.mux) muxCodec.value = preset.mux
        return encoder
      } catch {
        continue
      }
    }
  }
  return null
}

async function recordGenerated(
  duration: number,
  fileName: string,
  background: string,
  frameAt: (time: number) => {
    layout: SquishLayout
    backgroundStyle: SquishBackgroundStyleChoice
    seed: string
    wobble: boolean
    animate: boolean
  },
  width = 1080,
  height = 1080,
  format: MotionFormat = 'webm',
) {
  width &= ~1
  height &= ~1
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const side = Math.min(width, height)
  const ox = (width - side) / 2
  const oy = (height - side) / 2
  const context = canvas.getContext('2d', { alpha: true, desynchronized: true })
  if (!context) throw new Error('Canvas is unavailable')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  const image = new Image()
  const frames = Math.max(1, Math.round(duration * FPS))
  const paint = async (frame: number) => {
    const time = Math.min(duration, frame / FPS)
    const state = frameAt(time)
    const svg = renderLayout(state.layout, { size: side, seed: state.seed, backgroundStyle: state.backgroundStyle })
    const bitmap = await imageFor(svg, side, image)
    if (background === 'transparent') context.clearRect(0, 0, width, height)
    else {
      context.fillStyle = background
      context.fillRect(0, 0, width, height)
    }
    context.save()
    if (state.wobble) {
      const dx = Math.sin(time * 1.7) * 3.75
      const dy = Math.cos(time * 1.3) * 3.75
      const angle = (Math.sin(time) * 0.45 * Math.PI) / 180
      context.translate(ox + side / 2 + dx, oy + side / 2 + dy)
      context.rotate(angle)
      context.translate(-(ox + side / 2), -(oy + side / 2))
    }
    context.drawImage(bitmap, ox, oy, side, side)
    context.restore()
  }
  if (format === 'apng') {
    const pngs: Uint8Array[] = []
    for (let frame = 0; frame < frames; frame++) {
      await paint(frame)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('PNG frame failed')
      pngs.push(new Uint8Array(await blob.arrayBuffer()))
    }
    save(await pngsToApng(pngs, FPS), `${fileName}.png`)
    return
  }
  if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') {
    throw new Error('No video encoder available')
  }
  const muxCodec = { value: 'V_VP8' }
  const muxer = new WebmMuxer(width, height)
  const encoder = await createEncoder(width, height, (chunk) => muxer.add(chunk), WEBM_PRESETS, muxCodec)
  if (!encoder) throw new Error('No video encoder available')
  muxer.setCodec(muxCodec.value)
  try {
    for (let frame = 0; frame < frames; frame++) {
      await paint(frame)
      const videoFrame = new VideoFrame(canvas, {
        timestamp: Math.round(frame * FRAME_US),
        duration: Math.round(FRAME_US),
      })
      while (encoder.encodeQueueSize > 4) {
        await new Promise<void>((resolve) => encoder.addEventListener('dequeue', () => resolve(), { once: true }))
      }
      encoder.encode(videoFrame, { keyFrame: frame % FPS === 0 })
      videoFrame.close()
    }
    await encoder.flush()
  } finally {
    if (encoder.state !== 'closed') encoder.close()
  }
  save(muxer.build(), `${fileName}.webm`)
}

export async function exportToVideoAuto(
  seed: string,
  shape: SquishShapeChoice,
  expression: SquishExpressionChoice,
  background: string,
  fileName: string,
  duration = 3,
  eyeY = 0,
  split = 0,
  scale = 1,
  gaze = 1,
  backgroundStyle: SquishBackgroundStyleChoice = 'solid',
  width = 1080,
  height = 1080,
  format: MotionFormat = 'webm',
) {
  const engine = new SquishEngine(seed, { shape, expression })
  await recordGenerated(
    duration,
    fileName,
    background,
    (time) => ({
      layout: adjusted(engine, time, duration, eyeY, split, scale, gaze, false, 0, true),
      backgroundStyle,
      seed,
      wobble: false,
      animate: true,
    }),
    width,
    height,
    format,
  )
}

export async function exportToVideoSequence(
  steps: SequenceStep[],
  background: string,
  fileName: string,
  eyeY = 0,
  split = 0,
  scale = 1,
  gaze = 1,
  width = 1080,
  height = 1080,
  format: MotionFormat = 'webm',
) {
  if (!steps.length) return
  const engine = new SquishEngine(steps[0]!.seed, { shape: steps[0]!.shape, expression: steps[0]!.expression })
  let current = 0
  let boundary = steps[0]!.durationSec
  let stepStart = 0
  const total = steps.reduce((sum, step) => sum + step.durationSec, 0)
  await recordGenerated(
    total,
    fileName,
    background,
    (time) => {
      while (current < steps.length - 1 && time >= boundary) {
        current += 1
        stepStart = boundary
        boundary += steps[current]!.durationSec
        engine.name = steps[current]!.seed
        engine.setShape(resolveShape(engine.name, steps[current]!.shape), time)
        engine.setExpression(resolveExpression(engine.name, steps[current]!.expression), time)
      }
      const step = steps[current]!
      return {
        layout: adjusted(engine, time, total, eyeY, split, scale, gaze, step.blink, time - stepStart, step.animate),
        backgroundStyle: step.backgroundStyle,
        seed: step.seed,
        wobble: step.wobble,
        animate: step.animate,
      }
    },
    width,
    height,
    format,
  )
}
