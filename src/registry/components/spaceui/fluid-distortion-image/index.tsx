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

export interface FluidDistortionImageProps {
  src: string
  alt?: string
  aspectRatio?: number
  distortionIntensity?: number
  relaxationSpeed?: number
  radius?: number
  animateReveal?: boolean
  /** Entrance style: a soft blur/scale morph, or a pixelated sweep-in. @default 'blur' */
  revealStyle?: 'blur' | 'pixelate'
  pixelAccentColor?: string
  pixelGridDensity?: number
  pixelBandWidth?: number
  pixelNoiseIntensity?: number
  className?: string
}

const vertexShaderSource = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShaderSource = `
uniform sampler2D uSourceTexture;
uniform sampler2D uImpulseMap;
uniform vec4      uAspectResolution; // xy = quad dimensions, zw = image dimensions
uniform float     uDistortStrength;
uniform float     uPixelRevealOn;
uniform float     uPixelProgress;
uniform float     uPixelCellDensity;
uniform vec3      uPixelAccentColor;
uniform float     uPixelJitter;
uniform float     uPixelBand;
varying vec2      vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float quadAspect = uAspectResolution.x / max(uAspectResolution.y, 1.0);
  float imageAspect = uAspectResolution.z / max(uAspectResolution.w, 1.0);

  vec2 aspectCoverRatio;
  if (quadAspect < imageAspect) {
    aspectCoverRatio = vec2(quadAspect / imageAspect, 1.0);
  } else {
    aspectCoverRatio = vec2(1.0, imageAspect / quadAspect);
  }

  vec2 coveredCoordinates = (vUv - 0.5) * aspectCoverRatio + 0.5;
  vec4 impulseOffset = texture2D(uImpulseMap, vUv);

  vec2 displacedUV = coveredCoordinates - (uDistortStrength * impulseOffset.rg);
  vec4 surfaceColor = texture2D(uSourceTexture, clamp(displacedUV, 0.0, 1.0));

  if (uPixelRevealOn > 0.5) {
    vec2 cellCoord = vec2(vUv.x * quadAspect, vUv.y);
    vec2 cellIndex = floor(cellCoord * uPixelCellDensity);
    float sweepAxis = 1.0 - (cellIndex.y / uPixelCellDensity);

    float noiseA = (hash(cellIndex) - 0.5) * 2.0;
    float noiseB = (hash(cellIndex + vec2(19.1, 7.3)) - 0.5) * 2.0;
    float wavefront = sweepAxis + (noiseA + noiseB * 0.35) * uPixelJitter;
    float band = uPixelBand / uPixelCellDensity;

    if (wavefront > uPixelProgress + band) {
      discard;
    } else if (wavefront > uPixelProgress - band) {
      float flash = hash(cellIndex) * 0.25 + 0.75;
      gl_FragColor = vec4(uPixelAccentColor * flash, 1.0);
      return;
    }
  }

  gl_FragColor = surfaceColor;
}
`

const GRID_SIZE = 64

export function FluidDistortionImage({
  src,
  alt = 'Distorted surface image',
  aspectRatio,
  distortionIntensity = 0.02,
  relaxationSpeed = 0.95,
  radius = 8.96,
  animateReveal = true,
  revealStyle = 'blur',
  pixelAccentColor = '#ffe9a8',
  pixelGridDensity = 40,
  pixelBandWidth = 3.5,
  pixelNoiseIntensity = 0.16,
  className,
}: FluidDistortionImageProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [naturalAspect, setNaturalAspect] = React.useState<number | null>(aspectRatio ?? null)

  const mouseRef = React.useRef({ x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, vX: 0, vY: 0 })
  const isDocVisibleRef = React.useRef(true)
  const isVisibleRef = React.useRef(true)

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
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)
    renderer.setPixelRatio(dpr)

    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1000, 1000)
    camera.position.z = 2

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(1, 1)

    // DataTexture for fluid displacement grid (64x64)
    const dataArray = new Float32Array(GRID_SIZE * GRID_SIZE * 4)
    const dataTexture = new THREE.DataTexture(dataArray, GRID_SIZE, GRID_SIZE, THREE.RGBAFormat, THREE.FloatType)
    dataTexture.minFilter = THREE.NearestFilter
    dataTexture.magFilter = THREE.NearestFilter
    dataTexture.needsUpdate = true

    const pixelAccentVec = new THREE.Color(pixelAccentColor)

    const uniforms = {
      uSourceTexture: { value: null as THREE.Texture | null },
      uImpulseMap: { value: dataTexture },
      uAspectResolution: { value: new THREE.Vector4(1, 1, 1, 1) },
      uDistortStrength: { value: distortionIntensity },
      uPixelRevealOn: { value: revealStyle === 'pixelate' ? 1.0 : 0.0 },
      uPixelProgress: { value: -0.5 },
      uPixelCellDensity: { value: pixelGridDensity },
      uPixelAccentColor: { value: pixelAccentVec },
      uPixelJitter: { value: pixelNoiseIntensity },
      uPixelBand: { value: pixelBandWidth },
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      uniforms,
      transparent: true,
      depthTest: false,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    let imgWidth = 0
    let imgHeight = 0

    const updateDimensions = () => {
      if (!container) return
      const w = container.clientWidth
      const currentRatio = aspectRatio ?? (imgWidth && imgHeight ? imgWidth / imgHeight : undefined)
      const h = container.clientHeight || (currentRatio ? w / currentRatio : w * 0.6)
      renderer.setSize(w, h)
      const uW = imgWidth || w
      const uH = imgHeight || h
      uniforms.uAspectResolution.value.set(w, h, uW, uH)
    }

    // Reveal animation — either a blur/scale DOM morph, or a shader-driven pixelated sweep
    let revealTrigger: ScrollTrigger | null = null
    const usePixelReveal = animateReveal && revealStyle === 'pixelate'
    const useBlurReveal = animateReveal && revealStyle !== 'pixelate'

    if (useBlurReveal) {
      gsap.set(canvas, {
        scale: 1.04,
        opacity: 0,

        filter: 'blur(18px)',
      })

      const triggerReveal = () => {
        gsap.to(canvas, {
          scale: 1,
          opacity: 1,

          filter: 'blur(0px)',
          duration: 1.1,
          ease: 'power3.out',
        })
      }

      const rect = container.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.9) {
        triggerReveal()
      } else {
        revealTrigger = ScrollTrigger.create({
          trigger: container,
          start: 'top 85%',
          once: true,
          onEnter: triggerReveal,
        })
      }
    } else {
      gsap.set(canvas, { scale: 1, opacity: 1, filter: 'blur(0px)' })
    }

    let pixelTween: gsap.core.Tween | null = null
    if (usePixelReveal) {
      const triggerPixelReveal = () => {
        const state = { p: -0.5 }
        pixelTween = gsap.to(state, {
          p: 1.35,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            uniforms.uPixelProgress.value = state.p
          },
        })
      }

      const rect = container.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.9) {
        triggerPixelReveal()
      } else {
        revealTrigger = ScrollTrigger.create({
          trigger: container,
          start: 'top 85%',
          once: true,
          onEnter: triggerPixelReveal,
        })
      }
    } else if (!useBlurReveal) {
      uniforms.uPixelProgress.value = 1.35
    }

    let isCancelled = false

    const loadTextureSafely = async (url: string) => {
      const applyImageToTexture = (imageEl: HTMLImageElement) => {
        if (isCancelled) return
        const tex = new THREE.Texture(imageEl)
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.needsUpdate = true
        imgWidth = imageEl.width
        imgHeight = imageEl.height
        if (imgWidth && imgHeight) {
          setNaturalAspect(imgWidth / imgHeight)
        }
        uniforms.uSourceTexture.value = tex
        updateDimensions()
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
              logger.error('Failed to load image texture in fluid-distortion-image:', url, localErr)
            }
          }
        }
      }
    }

    loadTextureSafely(src)

    let animId = 0
    const maxDistSq = radius * radius

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop)

      // Relaxation decay
      const data = dataTexture.image.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= relaxationSpeed
        data[i + 1] *= relaxationSpeed
      }

      const mouse = mouseRef.current
      const gridX = GRID_SIZE * mouse.x
      const gridY = GRID_SIZE * (1 - mouse.y)

      for (let x = 0; x < GRID_SIZE; x++) {
        const dx = gridX - x
        for (let y = 0; y < GRID_SIZE; y++) {
          const dy = gridY - y
          const distSq = dx * dx + dy * dy
          if (distSq < maxDistSq) {
            const idx = 4 * (x + GRID_SIZE * y)
            const force = ((radius - Math.sqrt(distSq)) / radius) * 80
            data[idx] += force * mouse.vX
            data[idx + 1] -= force * mouse.vY
          }
        }
      }

      mouse.vX *= 0.8
      mouse.vY *= 0.8
      dataTexture.needsUpdate = true

      renderer.render(scene, camera)
    }
    renderLoop()

    const ro = new ResizeObserver(updateDimensions)
    ro.observe(container)

    return () => {
      isCancelled = true
      cancelAnimationFrame(animId)
      revealTrigger?.kill()
      pixelTween?.kill()
      ro.disconnect()
      geometry.dispose()
      material.dispose()
      dataTexture.dispose()
      if (uniforms.uSourceTexture.value) {
        uniforms.uSourceTexture.value.dispose()
      }
      renderer.dispose()
    }
  }, [
    src,
    aspectRatio,
    distortionIntensity,
    relaxationSpeed,
    radius,
    animateReveal,
    revealStyle,
    pixelAccentColor,
    pixelGridDensity,
    pixelBandWidth,
    pixelNoiseIntensity,
  ])

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    const mouse = mouseRef.current
    mouse.x = x
    mouse.y = y
    mouse.vX = mouse.x - mouse.prevX
    mouse.vY = mouse.y - mouse.prevY
    mouse.prevX = mouse.x
    mouse.prevY = mouse.y
  }

  const activeAspect = aspectRatio ?? naturalAspect

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className={cn('relative w-full overflow-hidden select-none', className)}
      style={activeAspect ? { aspectRatio: `${activeAspect}` } : undefined}
      aria-label={alt}
      role="img"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
