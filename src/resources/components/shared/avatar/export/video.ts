import { imageFor, save } from './raster'

let activeRecording: { recorder: MediaRecorder; frame: number; chunks: Blob[]; drawing: boolean } | null = null

function mimeType() {
  const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4']
  return types.find((type) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) ?? ''
}

export function startLiveRecording(
  source: SVGSVGElement | (() => SVGSVGElement | null) | null,
  background: string,
  width = 720,
  height = 720,
) {
  if (!source || activeRecording) return false
  const svg = typeof source === 'function' ? source() : source
  if (!svg) return false
  const type = mimeType()
  if (!type) return false
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return false
  const side = Math.min(width, height)
  const stream = canvas.captureStream(30)
  const recorder = new MediaRecorder(stream, { mimeType: type })
  const chunks: Blob[] = []
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data)
  }
  const session = { recorder, frame: 0, chunks, drawing: false }
  activeRecording = session
  recorder.start(100)
  const draw = () => {
    if (activeRecording !== session) return
    session.frame = window.requestAnimationFrame(draw)
    if (session.drawing) return
    const node = typeof source === 'function' ? source() : source
    if (!node) return
    session.drawing = true
    void imageFor(node, side)
      .then((image) => {
        if (activeRecording !== session) return
        if (background === 'transparent') context.clearRect(0, 0, width, height)
        else {
          context.fillStyle = background
          context.fillRect(0, 0, width, height)
        }
        context.drawImage(image, (width - side) / 2, (height - side) / 2, side, side)
      })
      .finally(() => {
        if (activeRecording === session) session.drawing = false
      })
  }
  session.frame = window.requestAnimationFrame(draw)
  return true
}

export function stopLiveRecording(fileName: string) {
  if (!activeRecording) return
  const session = activeRecording
  activeRecording = null
  window.cancelAnimationFrame(session.frame)
  const ext = session.recorder.mimeType.includes('mp4') ? 'mp4' : 'webm'
  session.recorder.onstop = () =>
    save(new Blob(session.chunks, { type: session.recorder.mimeType }), `${fileName}.${ext}`)
  if (session.recorder.state === 'recording') {
    session.recorder.requestData()
    session.recorder.stop()
  }
}

export function isLiveRecording() {
  return Boolean(activeRecording)
}
