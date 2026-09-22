'use client'

import * as React from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/registry/lib/utils'
import { getOptimizedImageUrl } from '@/registry/lib/next-image-url'
import { logger } from '@/registry/utils/logger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

function findScrollParent(node: HTMLElement | null): HTMLElement | Window {
  if (typeof window === 'undefined' || !node)
    return (typeof window !== 'undefined' ? window : null) as unknown as Window
  let parent: HTMLElement | null = node.parentElement
  while (parent) {
    const style = window.getComputedStyle(parent)
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      return parent
    }
    parent = parent.parentElement
  }
  return window
}

export interface PixelRevealImageProps {
  src: string
  alt?: string
  accentColor?: string
  gridDensity?: number
  bandWidth?: number
  noiseIntensity?: number
  direction?: 'top-to-bottom' | 'bottom-to-top'
  progress?: number
  trigger?: 'loop' | 'hover' | 'scroll'
  aspectRatio?: number
  className?: string
}

const vertexShaderSource = `
varying vec2 vCoord;
void main() {
  vCoord = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShaderSource = `
uniform sampler2D uImageTexture;
uniform float uTransitionProgress;
uniform float uCellDensity;
uniform vec3  uAccentColor;
uniform float uScrollDirection;
uniform float uJitterNoise;
uniform float uBandSpan;
uniform float uHasTexture;
uniform vec4  uAspectResolution; // xy = quad dimensions, zw = image dimensions
varying vec2  vCoord;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  if (uHasTexture < 0.5) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float quadAspect = uAspectResolution.x / max(uAspectResolution.y, 1.0);
  float imageAspect = uAspectResolution.z / max(uAspectResolution.w, 1.0);

  vec2 aspectCoverRatio;
  if (quadAspect < imageAspect) {
    aspectCoverRatio = vec2(quadAspect / imageAspect, 1.0);
  } else {
    aspectCoverRatio = vec2(1.0, imageAspect / quadAspect);
  }

  vec2 coveredCoordinates = (vCoord - 0.5) * aspectCoverRatio + 0.5;

  vec2 gridCoord = vec2(vCoord.x * quadAspect, vCoord.y);
  vec2 cellIndex = floor(gridCoord * uCellDensity);
  float normalizedY = cellIndex.y / uCellDensity;
  float sweepAxis = uScrollDirection > 0.0 ? (1.0 - normalizedY) : normalizedY;

  float primaryNoise = (hash(cellIndex) - 0.5) * 2.0;
  float crossNoise = (hash(cellIndex + vec2(19.1, 7.3)) - 0.5) * 2.0;
  float compositeNoise = (primaryNoise + crossNoise * 0.35) * uJitterNoise;

  float wavefrontThreshold = sweepAxis + compositeNoise;
  float normalizedBand = uBandSpan / uCellDensity;

  if (wavefrontThreshold > uTransitionProgress + normalizedBand) {
    discard;
  } else if (wavefrontThreshold > uTransitionProgress - normalizedBand) {
    float luminanceNoise = hash(cellIndex) * 0.25 + 0.75;
    gl_FragColor = vec4(uAccentColor * luminanceNoise, 1.0);
  } else {
    gl_FragColor = texture2D(uImageTexture, clamp(coveredCoordinates, 0.0, 1.0));
  }
}
`

export function PixelRevealImage({
  src,
  alt = 'Pixel reveal visual',
  accentColor = '#ffe9a8',
  gridDensity = 40,
  bandWidth = 3.5,
  noiseIntensity = 0.16,
  direction = 'bottom-to-top',
  progress: controlledProgress,
  trigger = 'loop',
  aspectRatio,
  className,
}: PixelRevealImageProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [naturalAspect, setNaturalAspect] = React.useState<number | null>(aspectRatio ?? null)
  const uniformsRef = React.useRef<{ [key: string]: THREE.IUniform }>({})
  const progressTargetRef = React.useRef(-0.5)
  const needsRenderRef = React.useRef(true)

  React.useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2))

    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(1, 1)

    const accentVec = new THREE.Color(accentColor)

    const uniforms = {
      uImageTexture: { value: null as THREE.Texture | null },
      uTransitionProgress: { value: -0.5 },
      uCellDensity: { value: gridDensity },
      uAccentColor: { value: accentVec },
      uScrollDirection: { value: direction === 'bottom-to-top' ? 1.0 : 0.0 },
      uJitterNoise: { value: noiseIntensity },
      uBandSpan: { value: bandWidth },
      uHasTexture: { value: 0.0 },
      uAspectResolution: { value: new THREE.Vector4(1, 1, 1, 1) },
    }
    uniformsRef.current = uniforms

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      uniforms,
      transparent: true,
      depthTest: false,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const updateDimensions = () => {
      if (!container) return
      const w = container.clientWidth
      const currentRatio = aspectRatio ?? naturalAspect
      const h = container.clientHeight || (currentRatio ? w / currentRatio : w * (9 / 16))
      renderer.setSize(w, h)
      camera.left = -w / 2
      camera.right = w / 2
      camera.top = h / 2
      camera.bottom = -h / 2
      camera.updateProjectionMatrix()
      mesh.scale.set(w, h, 1)

      const tex = uniforms.uImageTexture.value as THREE.Texture | null
      const imgW = tex?.image ? (tex.image as HTMLImageElement).width : w
      const imgH = tex?.image ? (tex.image as HTMLImageElement).height : h
      uniforms.uAspectResolution.value.set(w, h, imgW, imgH)

      needsRenderRef.current = true
    }

    const computeNativeScrollProgress = () => {
      if (!container || controlledProgress !== undefined) return
      const rect = container.getBoundingClientRect()
      const vh = window.innerHeight || 800

      // Starts cleanly as element enters bottom 82% of viewport
      // Completes when element reaches 20% of viewport
      const start = vh * 0.82
      const end = vh * 0.2
      const rawP = (start - rect.top) / Math.max(start - end, 1)
      const p = Math.max(0, Math.min(1, rawP))
      progressTargetRef.current = -0.5 + p * 2.0
      needsRenderRef.current = true
    }

    let animationFrameId = 0
    const tick = () => {
      animationFrameId = requestAnimationFrame(tick)
      const current = uniforms.uTransitionProgress.value as number
      const target = controlledProgress !== undefined ? controlledProgress : progressTargetRef.current
      const delta = target - current
      if (Math.abs(delta) > 0.0002) {
        uniforms.uTransitionProgress.value = current + delta * 0.08
        needsRenderRef.current = true
      }
      if (needsRenderRef.current) {
        renderer.render(scene, camera)
        needsRenderRef.current = false
      }
    }
    tick()

    let isCancelled = false

    const loadTextureSafely = async (url: string) => {
      const applyImageToTexture = (imageEl: HTMLImageElement) => {
        if (isCancelled) return
        const texture = new THREE.Texture(imageEl)
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.needsUpdate = true
        if (imageEl.width && imageEl.height) {
          setNaturalAspect(imageEl.width / imageEl.height)
        }
        uniforms.uImageTexture.value = texture
        uniforms.uHasTexture.value = 1.0
        updateDimensions()
        computeNativeScrollProgress()
        needsRenderRef.current = true
        setTimeout(() => {
          ScrollTrigger.refresh(true)
          computeNativeScrollProgress()
        }, 80)
      }

      const toSafeUrl = (targetUrl: string) => {
        if (!targetUrl) return targetUrl
        if (targetUrl.startsWith('blob:') || targetUrl.startsWith('data:')) return targetUrl
        try {
          return getOptimizedImageUrl(targetUrl, { width: 1600 })
        } catch {
          return targetUrl
        }
      }

      const tryDirectImage = (targetUrl: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const imgEl = new Image()
          if (!targetUrl.startsWith('blob:') && !targetUrl.startsWith('data:') && !targetUrl.startsWith('/')) {
            imgEl.crossOrigin = 'anonymous'
          }
          imgEl.onload = () => resolve(imgEl)
          imgEl.onerror = (e) => reject(e)
          imgEl.src = targetUrl
        })

      try {
        const optimized = toSafeUrl(url)
        const loadedImg = await tryDirectImage(optimized)
        applyImageToTexture(loadedImg)
        return
      } catch {
        try {
          const rawImg = await tryDirectImage(url)
          applyImageToTexture(rawImg)
          return
        } catch {
          const fileName = url.split('/').pop()?.split('?')[0]
          if (fileName && !url.includes('/samples/')) {
            try {
              const localImg = await tryDirectImage(`/samples/${fileName}`)
              applyImageToTexture(localImg)
              return
            } catch (localErr) {
              logger.error('Failed to load image texture:', url, localErr)
            }
          }
        }
      }
    }

    loadTextureSafely(src)

    const scroller = findScrollParent(container)
    let scrollTriggerInstance: ScrollTrigger | null = null
    let gsapTimeline: gsap.core.Timeline | null = null
    let hoverTween: gsap.core.Tween | null = null
    let onScroll: (() => void) | null = null

    if (controlledProgress !== undefined) {
      progressTargetRef.current = controlledProgress
    } else if (trigger === 'hover') {
      // Hover mode: image is already fully revealed; hovering triggers the pixel reveal wave
      uniforms.uTransitionProgress.value = 1.35
      needsRenderRef.current = true

      const handlePointerEnter = () => {
        hoverTween?.kill()
        const state = { p: 0.0 }
        uniforms.uTransitionProgress.value = 0.0
        needsRenderRef.current = true
        hoverTween = gsap.to(state, {
          p: 1.35,
          duration: 0.95,
          ease: 'power2.out',
          onUpdate: () => {
            uniforms.uTransitionProgress.value = state.p
            needsRenderRef.current = true
          },
        })
      }
      container.addEventListener('pointerenter', handlePointerEnter)
    } else if (trigger === 'loop') {
      const state = { p: -0.5 }
      gsapTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.6 })
      gsapTimeline
        .to(state, {
          p: 1.35,
          duration: 2.0,
          ease: 'power2.out',
          onUpdate: () => {
            uniforms.uTransitionProgress.value = state.p
            needsRenderRef.current = true
          },
        })
        .to(state, {
          p: 1.35,
          duration: 2.0,
        })
        .to(state, {
          p: -0.5,
          duration: 1.1,
          ease: 'power2.inOut',
          onUpdate: () => {
            uniforms.uTransitionProgress.value = state.p
            needsRenderRef.current = true
          },
        })
    } else {
      // scroll mode
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: container,
        scroller: scroller === window ? undefined : scroller,
        start: 'top 82%',
        end: 'top 20%',
        scrub: true,
        onUpdate: (self) => {
          progressTargetRef.current = -0.5 + self.progress * 2.0
          needsRenderRef.current = true
        },
      })

      onScroll = () => computeNativeScrollProgress()
      window.addEventListener('scroll', onScroll, { passive: true, capture: true })
      document.addEventListener('scroll', onScroll, { passive: true, capture: true })
      if (scroller !== window) {
        scroller.addEventListener('scroll', onScroll, { passive: true, capture: true })
      }
      computeNativeScrollProgress()
    }

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
      if (trigger === 'scroll') computeNativeScrollProgress()
    })
    resizeObserver.observe(container)

    return () => {
      isCancelled = true
      cancelAnimationFrame(animationFrameId)
      gsapTimeline?.kill()
      hoverTween?.kill()
      scrollTriggerInstance?.kill()
      if (onScroll) {
        window.removeEventListener('scroll', onScroll, { capture: true } as any)
        document.removeEventListener('scroll', onScroll, { capture: true } as any)
        if (scroller !== window) {
          scroller.removeEventListener('scroll', onScroll, { capture: true } as any)
        }
      }
      resizeObserver.disconnect()
      geometry.dispose()
      material.dispose()
      if (uniforms.uImageTexture.value) {
        ;(uniforms.uImageTexture.value as THREE.Texture).dispose()
      }
      renderer.dispose()
    }
  }, [src, accentColor, gridDensity, bandWidth, noiseIntensity, direction, controlledProgress, trigger, aspectRatio])

  const activeAspect = aspectRatio ?? naturalAspect ?? 16 / 9

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full overflow-hidden', className)}
      style={{ aspectRatio: `${activeAspect}` }}
      aria-label={alt}
      role="img"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
