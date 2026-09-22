import { ArrayBufferTarget, Muxer } from 'mp4-muxer'
import { toCanvas } from 'html-to-image'
import { logger } from '@/registry/utils/logger'

export interface RecordInteractionOptions {
  stage: HTMLElement
  shortName: string
  outputWidth: number
  outputHeight: number
  scale: number
  pan: { x: number; y: number }
  fps: number
  durationMs: number
  maxWatchdogMs: number
  withSound: boolean
  onProgress: (pct: number) => void
  onStatusChange: (status: string | null) => void
  checkCancelled: () => boolean
  checkSequenceFinished: () => boolean
  onStartCapture?: () => Promise<void> | void
}

export interface RecordResult {
  blob: Blob
  fileName: string
}

export function formatTimestamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 8000)
}

async function tryCreateVideoEncoder(
  width: number,
  height: number,
  fps: number,
  bitrate: number,
  hasAudio: boolean,
): Promise<{
  encoder: VideoEncoder
  muxer: Muxer<ArrayBufferTarget>
  videoChunkCountRef: { current: number }
} | null> {
  if (typeof window === 'undefined' || !('VideoEncoder' in window)) return null

  const is4K = width > 1920 || height > 1080
  const candidateCodecs = is4K
    ? [
        'avc1.640033', // High Profile Level 5.1 (Full 4K UHD, NVENC hardware accelerated)
        'avc1.4d0033', // Main Profile Level 5.1 (Full 4K UHD)
        'avc1.640034', // High Profile Level 5.2 (4K 60fps)
        'avc1.64002a', // High Profile Level 4.2
        'avc1.4d002a', // Main Profile Level 4.2
      ]
    : [
        'avc1.64002a', // High Profile Level 4.2 (1080p High Quality)
        'avc1.4d002a', // Main Profile Level 4.2
        'avc1.640033', // High Profile Level 5.1
        'avc1.42002a', // Baseline Profile Level 4.2
      ]

  for (const codec of candidateCodecs) {
    try {
      const config = {
        codec,
        width,
        height,
        bitrate,
        framerate: fps,
        latencyMode: 'quality' as const,
      }
      const supported = await VideoEncoder.isConfigSupported(config)
      if (!supported.supported) continue

      // Verify with a test frame that the hardware/software encoder actually starts
      let testEncoderError = false
      const testEncoder = new VideoEncoder({
        output: () => {},
        error: () => {
          testEncoderError = true
        },
      })
      testEncoder.configure(config)

      const testCanvas = document.createElement('canvas')
      testCanvas.width = width
      testCanvas.height = height
      const testCtx = testCanvas.getContext('2d')
      if (testCtx) testCtx.fillRect(0, 0, width, height)

      const testFrame = new VideoFrame(testCanvas, { timestamp: 0, duration: 33333 })
      testEncoder.encode(testFrame, { keyFrame: true })
      testFrame.close()
      await testEncoder.flush()
      testEncoder.close()
      testCanvas.remove()

      if (testEncoderError) continue

      // Test passed! Now create real muxer and encoder
      const target = new ArrayBufferTarget()
      const muxer = new Muxer({
        target,
        video: { codec: 'avc', width, height, frameRate: fps },
        ...(hasAudio ? { audio: { codec: 'aac', numberOfChannels: 2, sampleRate: 48000 } } : {}),
        fastStart: 'in-memory',
        firstTimestampBehavior: 'offset',
      })

      const videoChunkCountRef = { current: 0 }
      let cachedDecoderConfig: any = null

      let encoderError: Error | null = null
      const encoder = new VideoEncoder({
        output: (chunk, meta) => {
          videoChunkCountRef.current++
          if (meta && meta.decoderConfig) {
            const rawColorSpace = meta.decoderConfig.colorSpace || {}
            cachedDecoderConfig = {
              ...meta.decoderConfig,
              colorSpace: {
                primaries: rawColorSpace.primaries ?? 'bt709',
                transfer: rawColorSpace.transfer ?? 'iec61966-2-1',
                matrix: rawColorSpace.matrix ?? 'bt709',
                fullRange: Boolean(rawColorSpace.fullRange),
              },
            }
          }
          const finalMeta = meta?.decoderConfig
            ? { ...meta, decoderConfig: cachedDecoderConfig }
            : cachedDecoderConfig
              ? { ...meta, decoderConfig: cachedDecoderConfig }
              : {
                  ...meta,
                  decoderConfig: {
                    codec,
                    codedWidth: width,
                    codedHeight: height,
                    colorSpace: {
                      primaries: 'bt709',
                      transfer: 'iec61966-2-1',
                      matrix: 'bt709',
                      fullRange: false,
                    },
                  },
                }
          try {
            muxer.addVideoChunk(chunk, finalMeta)
          } catch (chunkErr) {
            logger.warn('[InteractionRecorder] muxer addVideoChunk warning:', chunkErr)
          }
        },
        error: (err) => {
          encoderError = err
          logger.error('[InteractionRecorder] VideoEncoder error:', err)
        },
      })

      encoder.configure(config)
      await new Promise((r) => setTimeout(r, 40))
      if (encoderError || encoder.state !== 'configured') {
        try {
          encoder.close()
        } catch {
          /* ignored */
        }
        continue
      }

      return { encoder, muxer, videoChunkCountRef }
    } catch {
      // try next candidate
    }
  }

  return null
}

async function tryCreateAudioEncoder(
  muxer: Muxer<ArrayBufferTarget>,
  audioTrack: MediaStreamTrack,
): Promise<{
  audioEncoder: any
  audioCtx: AudioContext
  sourceNode: MediaStreamAudioSourceNode
  scriptNode: ScriptProcessorNode
} | null> {
  const AudioEncoderClass = typeof AudioEncoder !== 'undefined' ? AudioEncoder : (window as any).AudioEncoder
  if (!AudioEncoderClass) return null

  const audioConfig = {
    codec: 'mp4a.40.2',
    sampleRate: 48000,
    numberOfChannels: 2,
    bitrate: 128000,
  }

  try {
    const supported = await AudioEncoderClass.isConfigSupported(audioConfig)
    if (!supported.supported) return null

    let encoderError: Error | null = null
    const audioEncoder = new AudioEncoderClass({
      output: (chunk: any, meta: any) => muxer.addAudioChunk(chunk, meta),
      error: (err: any) => {
        encoderError = err
        logger.warn('[InteractionRecorder] AudioEncoder error:', err)
      },
    })

    audioEncoder.configure(audioConfig)
    await new Promise((r) => setTimeout(r, 20))
    if (encoderError || audioEncoder.state !== 'configured') {
      try {
        audioEncoder.close()
      } catch {
        /* ignored */
      }
      return null
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) {
      try {
        audioEncoder.close()
      } catch {
        /* ignored */
      }
      return null
    }

    const audioCtx = new AudioContextClass({ sampleRate: 48000 })
    const sourceNode = audioCtx.createMediaStreamSource(new MediaStream([audioTrack]))
    const scriptNode = audioCtx.createScriptProcessor(4096, 2, 2)
    let audioTimestampUs = 0

    scriptNode.onaudioprocess = (e: AudioProcessingEvent) => {
      if (audioEncoder.state !== 'configured') return
      const inputBuffer = e.inputBuffer
      const numChannels = inputBuffer.numberOfChannels
      const numFrames = inputBuffer.length
      const planarData = new Float32Array(numChannels * numFrames)
      for (let ch = 0; ch < numChannels; ch++) {
        planarData.set(inputBuffer.getChannelData(ch), ch * numFrames)
      }
      try {
        const AudioDataClass = typeof AudioData !== 'undefined' ? AudioData : (window as any).AudioData
        if (!AudioDataClass) return
        const audioData = new AudioDataClass({
          format: 'f32-planar',
          sampleRate: inputBuffer.sampleRate,
          numberOfFrames: numFrames,
          numberOfChannels: numChannels,
          timestamp: audioTimestampUs,
          data: planarData,
        })
        audioTimestampUs += Math.round((numFrames / inputBuffer.sampleRate) * 1_000_000)
        audioEncoder.encode(audioData)
        audioData.close()
      } catch (err) {
        logger.warn('[InteractionRecorder] Audio encode frame error:', err)
      }
    }

    sourceNode.connect(scriptNode)
    scriptNode.connect(audioCtx.destination)

    return {
      audioEncoder,
      audioCtx,
      sourceNode,
      scriptNode,
    }
  } catch (err) {
    logger.warn('[InteractionRecorder] Audio encoder setup failed:', err)
    return null
  }
}

export async function recordInteraction(options: RecordInteractionOptions): Promise<RecordResult> {
  const {
    stage,
    shortName,
    outputWidth,
    outputHeight,
    scale,
    pan,
    fps,
    durationMs,
    maxWatchdogMs,
    withSound,
    onProgress,
    onStatusChange,
    checkCancelled,
    checkSequenceFinished,
    onStartCapture,
  } = options

  let displayStream: MediaStream | null = null
  let recordCanvas: HTMLCanvasElement | null = null
  let sourceVideo: HTMLVideoElement | null = null
  let videoTrack: MediaStreamTrack | null = null
  let onEndedListener: (() => void) | null = null
  let streamEnded = false
  let rafId: number | null = null

  let encoder: VideoEncoder | null = null
  let muxer: Muxer<ArrayBufferTarget> | null = null
  let audioPackage: {
    audioEncoder: any
    audioCtx: AudioContext
    sourceNode: MediaStreamAudioSourceNode
    scriptNode: ScriptProcessorNode
  } | null = null
  let recorder: MediaRecorder | null = null
  let stopped: Promise<void> | null = null
  const chunks: BlobPart[] = []

  const releaseStream = () => {
    if (onEndedListener && videoTrack) {
      try {
        videoTrack.removeEventListener('ended', onEndedListener)
      } catch {}
      onEndedListener = null
    }
    if (displayStream) {
      try {
        displayStream.getTracks().forEach((track) => {
          try {
            track.stop()
          } catch {}
        })
      } catch {}
      displayStream = null
    }
    if (sourceVideo) {
      try {
        sourceVideo.pause()
        sourceVideo.srcObject = null
        sourceVideo.load()
      } catch {}
      try {
        sourceVideo.remove()
      } catch {}
      sourceVideo = null
    }
  }

  try {
    onStatusChange(withSound ? 'Pick this tab and enable "Share tab audio"…' : 'Pick this tab to share…')
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: Math.max(3840, outputWidth) },
        height: { ideal: Math.max(2160, outputHeight) },
        frameRate: { ideal: fps, max: 60 },
        displaySurface: 'browser',
      },
      audio: withSound,
      preferCurrentTab: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    videoTrack = displayStream.getVideoTracks()[0]
    if (!videoTrack) throw new Error('No video was shared.')
    if (withSound && displayStream.getAudioTracks().length === 0) {
      throw new Error('No audio track was shared — retry and enable "Share tab audio".')
    }

    onEndedListener = () => {
      streamEnded = true
    }
    videoTrack.addEventListener('ended', onEndedListener)

    sourceVideo = document.createElement('video')
    sourceVideo.srcObject = displayStream
    sourceVideo.muted = true
    sourceVideo.playsInline = true
    await sourceVideo.play()
    await Promise.race([
      new Promise<void>((resolve) => {
        if (sourceVideo!.readyState >= 2) resolve()
        else sourceVideo!.onloadeddata = () => resolve()
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('The shared tab never started streaming video.')), 5000),
      ),
    ])

    const canvas = document.createElement('canvas')
    recordCanvas = canvas
    canvas.width = outputWidth
    canvas.height = outputHeight
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '1px'
    canvas.style.height = '1px'
    canvas.style.opacity = '0'
    canvas.style.pointerEvents = 'none'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    const backgroundColor = getComputedStyle(document.body).backgroundColor || '#000000'

    // High bitrate for 4K Retina encoding (up to 45 Mbps on RTX 3070 NVENC)
    const bitrate = Math.min(50_000_000, Math.max(16_000_000, Math.round(outputWidth * outputHeight * fps * 0.18)))
    const audioTrack = displayStream.getAudioTracks()[0]
    const wantAudio = Boolean(withSound && audioTrack)

    let canAudio = false
    const AudioEncoderClass = typeof AudioEncoder !== 'undefined' ? AudioEncoder : (window as any).AudioEncoder
    if (wantAudio && AudioEncoderClass) {
      try {
        const sup = await AudioEncoderClass.isConfigSupported({
          codec: 'mp4a.40.2',
          sampleRate: 48000,
          numberOfChannels: 2,
          bitrate: 128000,
        })
        canAudio = Boolean(sup.supported)
      } catch {
        canAudio = false
      }
    }

    // Try creating modern WebCodecs VideoEncoder + mp4-muxer with FastStart
    const encResult = await tryCreateVideoEncoder(outputWidth, outputHeight, fps, bitrate, canAudio)
    const useWebCodecs = Boolean(encResult)
    const videoChunkCountRef = encResult?.videoChunkCountRef ?? { current: 0 }

    if (encResult) {
      encoder = encResult.encoder
      muxer = encResult.muxer
      if (canAudio && audioTrack) {
        audioPackage = await tryCreateAudioEncoder(muxer, audioTrack)
      }
    } else {
      // Fallback to MediaRecorder if WebCodecs is unavailable
      const videoOutStream = canvas.captureStream(fps)
      const tracks: MediaStreamTrack[] = [...videoOutStream.getVideoTracks()]
      if (audioTrack) tracks.push(audioTrack)
      const combined = new MediaStream(tracks)

      const mimeCandidates = [
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp9',
        'video/webm',
      ]
      const mime = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m))
      if (!mime) throw new Error('Video recording is not supported in this browser')

      recorder = new MediaRecorder(combined, {
        mimeType: mime,
        videoBitsPerSecond: bitrate,
      })
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data)
      }
      stopped = new Promise<void>((resolve) => {
        recorder!.onstop = () => resolve()
      })
      recorder.start()
    }

    onStatusChange('Recording…')

    if (onStartCapture) {
      await onStartCapture()
    }

    if (recorder && recorder.state === 'inactive') {
      recorder.start()
    }

    let frameIndex = 0
    let lastFrameTime = -1000
    let lastFrameTimestampUs = -1
    let lastKeyFrameTimeUs = -10_000_000
    const frameIntervalMs = 1000 / fps
    const startedAt = performance.now()

    // Cache geometry to avoid synchronous DOM reflows inside requestAnimationFrame
    let sx = 0
    let sy = 0
    let sw = 0
    let sh = 0
    let elementWidth = 0
    let elementHeight = 0
    let drawX = 0
    let drawY = 0

    const updateGeometry = () => {
      if (!stage || !sourceVideo || sourceVideo.videoWidth === 0) return
      const rect = stage.getBoundingClientRect()
      const videoScaleX = sourceVideo.videoWidth / window.innerWidth
      const videoScaleY = sourceVideo.videoHeight / window.innerHeight
      sx = rect.left * videoScaleX
      sy = rect.top * videoScaleY
      sw = rect.width * videoScaleX
      sh = rect.height * videoScaleY
      elementWidth = Math.round(rect.width * scale)
      elementHeight = Math.round(rect.height * scale)
      drawX = Math.round((outputWidth - elementWidth) / 2 + pan.x * scale)
      drawY = Math.round((outputHeight - elementHeight) / 2 + pan.y * scale)
    }

    updateGeometry()
    let lastGeometryUpdate = startedAt

    await new Promise<void>((resolve) => {
      const drawFrame = () => {
        const elapsed = performance.now() - startedAt
        if (checkCancelled() || checkSequenceFinished() || streamEnded || elapsed >= maxWatchdogMs) {
          resolve()
          return
        }

        // Periodically refresh geometry in case layout shifts, without reflowing every frame
        if (performance.now() - lastGeometryUpdate > 500) {
          updateGeometry()
          lastGeometryUpdate = performance.now()
        }

        if (useWebCodecs && encoder) {
          if (elapsed - lastFrameTime >= frameIntervalMs * 0.92) {
            lastFrameTime = elapsed

            ctx.fillStyle = backgroundColor
            ctx.fillRect(0, 0, outputWidth, outputHeight)
            if (sw > 0 && sh > 0 && sourceVideo) {
              ctx.imageSmoothingEnabled = true
              ctx.imageSmoothingQuality = 'high'
              ctx.drawImage(sourceVideo, sx, sy, sw, sh, drawX, drawY, elementWidth, elementHeight)
            }

            if (encoder.state === 'configured') {
              // Real-time microsecond timestamp strictly matching wall-clock elapsed time
              const elapsedUs = frameIndex === 0 ? 0 : Math.round(elapsed * 1000)
              const frameTimestampUs = frameIndex === 0 ? 0 : Math.max(lastFrameTimestampUs + 1000, elapsedUs)
              const frameDurationUs = Math.max(1000, Math.round(1_000_000 / fps))
              lastFrameTimestampUs = frameTimestampUs

              const isKeyFrame = frameIndex === 0 || frameTimestampUs - lastKeyFrameTimeUs >= 2_000_000
              if (isKeyFrame) {
                lastKeyFrameTimeUs = frameTimestampUs
              }

              const videoFrame = new VideoFrame(canvas, {
                timestamp: frameTimestampUs,
                duration: frameDurationUs,
              })
              try {
                encoder.encode(videoFrame, { keyFrame: isKeyFrame })
              } catch (err) {
                logger.warn('[InteractionRecorder] Encoding frame error:', err)
              } finally {
                videoFrame.close()
              }
            }

            frameIndex++
          }
        } else {
          // Fallback for MediaRecorder
          ctx.fillStyle = backgroundColor
          ctx.fillRect(0, 0, outputWidth, outputHeight)
          if (sw > 0 && sh > 0 && sourceVideo) {
            ctx.drawImage(sourceVideo, sx, sy, sw, sh, drawX, drawY, elementWidth, elementHeight)
          }
        }

        onProgress(Math.min(99, Math.round((elapsed / durationMs) * 100)))
        rafId = requestAnimationFrame(drawFrame)
      }
      rafId = requestAnimationFrame(drawFrame)
    })

    // Instantly terminate display capture so the browser screen sharing banner disappears immediately
    releaseStream()

    onStatusChange('Finalizing MP4…')

    let finalBlob: Blob
    let ext = 'mp4'

    if (useWebCodecs && encoder && muxer && videoChunkCountRef.current > 0) {
      if (audioPackage?.audioEncoder) {
        try {
          if (audioPackage.audioEncoder.state === 'configured') {
            await audioPackage.audioEncoder.flush()
          }
        } catch {
          /* ignored */
        }
        try {
          audioPackage.audioEncoder.close()
        } catch {
          /* ignored */
        }
      }
      audioPackage?.scriptNode.disconnect()
      audioPackage?.sourceNode.disconnect()
      if (audioPackage?.audioCtx) {
        try {
          await audioPackage.audioCtx.close()
        } catch {
          /* ignored */
        }
      }
      audioPackage = null

      await encoder.flush()
      encoder.close()
      encoder = null
      muxer.finalize()
      finalBlob = new Blob([muxer.target.buffer], { type: 'video/mp4' })
      ext = 'mp4'
    } else if (recorder && stopped) {
      recorder.stop()
      await stopped
      const mime = recorder.mimeType || 'video/mp4'
      ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm'
      finalBlob = new Blob(chunks, { type: mime })
    } else {
      throw new Error('Recording ended before any video frames could be captured. Please retry.')
    }

    const fileName = `${shortName}-spaceui-atom-record-${formatTimestamp()}.${ext}`
    return { blob: finalBlob, fileName }
  } finally {
    if (rafId !== null) cancelAnimationFrame(rafId)
    releaseStream()
    if (audioPackage?.audioEncoder) {
      try {
        audioPackage.audioEncoder.close()
      } catch {
        /* ignored */
      }
    }
    audioPackage?.scriptNode.disconnect()
    audioPackage?.sourceNode.disconnect()
    if (audioPackage?.audioCtx) {
      try {
        await audioPackage.audioCtx.close()
      } catch {
        /* ignored */
      }
    }
    if (encoder) {
      try {
        encoder.close()
      } catch {
        /* ignored */
      }
    }
    recordCanvas?.remove()
  }
}

export interface CaptureScreenshotOptions {
  stage: HTMLElement
  shortName: string
  outputWidth: number
  outputHeight: number
  scale: number
  pan: { x: number; y: number }
  elementZoom?: number
}

export async function captureScreenshot(options: CaptureScreenshotOptions): Promise<RecordResult> {
  const { stage, shortName, outputWidth, outputHeight, scale, pan, elementZoom = 1.6 } = options

  // Wait for web fonts to be fully rendered
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready
    } catch {}
  }

  // Super-sampled pixel ratio to guarantee true 4K/Retina vector fidelity
  const deviceDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const neededMultiplier = Math.max(3, Math.ceil(elementZoom * scale * Math.max(1, deviceDpr)))
  // Cap between 3 and 6 to guarantee pristine subpixel vector precision without memory overflow
  const superSampleRatio = Math.min(6, Math.max(3, neededMultiplier))

  // Render the interaction element via html-to-image with super-sampling
  const stageCanvas = await toCanvas(stage, {
    pixelRatio: superSampleRatio,
    cacheBust: true,
    skipAutoScale: true,
    style: {
      transform: 'none',
      transformOrigin: 'center center',
    },
  })

  // Create composite framed canvas at the requested export dimensions
  const finalCanvas = document.createElement('canvas')
  const finalWidth = Math.max(2, Math.round(outputWidth * scale))
  const finalHeight = Math.max(2, Math.round(outputHeight * scale))
  finalCanvas.width = finalWidth
  finalCanvas.height = finalHeight

  const ctx = finalCanvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Theme-aware background
  const backgroundColor =
    typeof document !== 'undefined' ? getComputedStyle(document.body).backgroundColor || '#000000' : '#000000'
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, finalWidth, finalHeight)

  // Natural 1x dimensions of stageCanvas (since rendered with superSampleRatio)
  const naturalW = stageCanvas.width / superSampleRatio
  const naturalH = stageCanvas.height / superSampleRatio
  const drawW = Math.round(naturalW * elementZoom * scale)
  const drawH = Math.round(naturalH * elementZoom * scale)
  const drawX = Math.round((finalWidth - drawW) / 2 + pan.x * scale)
  const drawY = Math.round((finalHeight - drawH) / 2 + pan.y * scale)

  ctx.drawImage(stageCanvas, drawX, drawY, drawW, drawH)

  const blob = await new Promise<Blob>((resolve, reject) => {
    finalCanvas.toBlob((b) => {
      if (b) resolve(b)
      else reject(new Error('Failed to create PNG blob'))
    }, 'image/png')
  })

  const fileName = `${shortName || 'interaction'}-spaceui-atom-screenshot-${formatTimestamp()}.png`
  return { blob, fileName }
}
