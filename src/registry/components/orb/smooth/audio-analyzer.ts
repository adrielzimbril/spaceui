// ============================================
// Audio Analyzer (Web Audio API helper)
// ============================================

import { logger } from '@/registry/utils/logger'

let sharedAudioCtx: AudioContext | null = null

function getOrCreateAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext only available in browser')
  }
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    sharedAudioCtx = new AudioCtx()
  }
  return sharedAudioCtx
}

export class AudioAnalyzer {
  audioCtx: AudioContext | null = null
  analyser: AnalyserNode | null = null
  sampleRate: number = 48000
  bufferLength: number = 0
  dataArray: Uint8Array = new Uint8Array(0)
  isElementMode = false

  lowFreqEnd = 200
  midFreqStart = 200
  midFreqEnd = 2000
  highFreqStart = 2000
  highFreqEnd = 20000

  lowAvg = 0
  midAvg = 0
  highAvg = 0
  allAvg = 0
  stream: MediaStream | null = null

  async initMic() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.audioCtx = getOrCreateAudioContext()
      this.analyser = this.audioCtx.createAnalyser()
      this.analyser.fftSize = 256
      this.sampleRate = this.audioCtx.sampleRate
      this.bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(this.bufferLength)

      const source = this.audioCtx.createMediaStreamSource(this.stream)
      source.connect(this.analyser)

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }
      return true
    } catch (e) {
      logger.warn('Microphone access denied or error:', e)
      return false
    }
  }

  async initElement(audioElement: HTMLAudioElement) {
    try {
      this.isElementMode = true
      this.audioCtx = getOrCreateAudioContext()
      this.analyser = this.audioCtx.createAnalyser()
      this.analyser.fftSize = 256
      this.sampleRate = this.audioCtx.sampleRate
      this.bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(this.bufferLength)

      // Reuse existing source on the HTMLAudioElement if already created to prevent InvalidStateError
      const el = audioElement as any
      let source: MediaElementAudioSourceNode
      if (el.__mediaElementSource && el.__audioCtx === this.audioCtx) {
        source = el.__mediaElementSource
      } else {
        source = this.audioCtx.createMediaElementSource(audioElement)
        el.__mediaElementSource = source
        el.__audioCtx = this.audioCtx
      }

      // Connect source to analyser and to speakers
      source.connect(this.analyser)
      this.analyser.connect(this.audioCtx.destination)

      const resumeContext = () => {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume()
        }
      }

      audioElement.addEventListener('play', resumeContext)
      audioElement.addEventListener('playing', resumeContext)
      audioElement.addEventListener('canplay', resumeContext)
      audioElement.addEventListener('timeupdate', resumeContext)

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume()
      }
      try {
        await audioElement.play()
      } catch {
        // autoplay blocked — analyser still works once the user hits play
      }
      return true
    } catch (e) {
      logger.warn('Audio element routing error:', e)
      return false
    }
  }

  getFrequencyRange(startFreq: number, endFreq: number) {
    const startBin = Math.round((startFreq / (this.sampleRate / 2)) * this.bufferLength)
    const endBin = Math.round((endFreq / (this.sampleRate / 2)) * this.bufferLength)
    return [Math.max(0, startBin), Math.min(this.bufferLength - 1, endBin)]
  }

  getAverageFrequencyRange(startBin: number, endBin: number) {
    let sum = 0
    let count = 0
    for (let i = startBin; i <= endBin; i++) {
      sum += this.dataArray[i]
      count++
    }
    return count > 0 ? sum / count : 0
  }

  update() {
    if (!this.analyser) return
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume()
    }
    this.analyser.getByteFrequencyData(this.dataArray as any)

    const [lStart, lEnd] = this.getFrequencyRange(0, this.lowFreqEnd)
    const [mStart, mEnd] = this.getFrequencyRange(this.midFreqStart, this.midFreqEnd)
    const [hStart, hEnd] = this.getFrequencyRange(this.highFreqStart, this.highFreqEnd)

    this.lowAvg = this.getAverageFrequencyRange(lStart, lEnd)
    this.midAvg = this.getAverageFrequencyRange(mStart, mEnd)
    this.highAvg = this.getAverageFrequencyRange(hStart, hEnd)
    this.allAvg = this.getAverageFrequencyRange(0, this.bufferLength - 1)
  }

  dispose() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop())
      this.stream = null
    }
    if (this.audioCtx && !this.isElementMode && this.audioCtx !== sharedAudioCtx) {
      this.audioCtx.close()
    }
  }
}
