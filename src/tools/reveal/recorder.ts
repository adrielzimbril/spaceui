export interface RecorderOptions {
  fps?: number
  bitsPerSecond?: number
}

export class CanvasRecorder {
  private canvas: HTMLCanvasElement
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private timeout: number | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  get isRecording() {
    return this.mediaRecorder !== null
  }

  start(durationSec: number, onProgress?: (secondsLeft: number) => void, opts: RecorderOptions = {}): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (this.mediaRecorder) return reject(new Error('already recording'))
      const types = [
        'video/mp4',
        'video/webm;codecs=h264',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
      ]
      const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
      const stream = this.canvas.captureStream(opts.fps ?? 60)
      const recOpts: MediaRecorderOptions = {
        videoBitsPerSecond: opts.bitsPerSecond ?? 40_000_000,
      }
      if (mimeType) recOpts.mimeType = mimeType
      const rec = new MediaRecorder(stream, recOpts)
      this.mediaRecorder = rec
      this.chunks = []
      rec.ondataavailable = (e) => e.data.size > 0 && this.chunks.push(e.data)
      rec.onstop = () => {
        const type = rec.mimeType || mimeType || 'video/webm'
        const blob = new Blob(this.chunks, { type })
        this.mediaRecorder = null
        this.chunks = []
        if (this.timeout !== null) {
          window.clearTimeout(this.timeout)
          this.timeout = null
        }
        resolve(blob)
      }
      rec.onerror = (e) => reject(e)
      rec.start()
      let left = durationSec
      const tick = () => {
        left--
        onProgress?.(left)
        if (left > 0) this.timeout = window.setTimeout(tick, 1000)
        else if (this.mediaRecorder?.state !== 'inactive') this.mediaRecorder?.stop()
      }
      onProgress?.(left)
      this.timeout = window.setTimeout(tick, 1000)
    })
  }

  cancel() {
    if (!this.mediaRecorder) return
    if (this.timeout !== null) {
      window.clearTimeout(this.timeout)
      this.timeout = null
    }
    this.chunks = []
    if (this.mediaRecorder.state !== 'inactive') this.mediaRecorder.stop()
    this.mediaRecorder = null
  }
}
