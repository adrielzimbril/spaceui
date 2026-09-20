'use client'

import * as React from 'react'
import * as THREE from 'three'
import { cn } from '@/registry/lib/utils'
import { getOptimizedImageUrl } from '@/registry/lib/next-image-url'

export interface FluidCrossfadeProps {
  imageA: string
  imageB: string
  alt?: string
  ditherGrid?: number
  pixelGridSize?: number
  refractionStrength?: number
  aspectRatio?: number
  className?: string
}

const simVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const simFragmentShader = `
uniform sampler2D uSimulationTexture;
uniform vec2 uGridResolution;
uniform vec2 uPointer;
uniform vec2 uPrevPointer;
uniform float uIsPointerActive;
uniform float uAspect;
uniform float uDamp;
uniform float uSpringForce;
uniform float uBrushRadius;
varying vec2 vUv;

float segmentDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec2 delta = 1.0 / uGridResolution;
  vec4 currentSample = texture2D(uSimulationTexture, vUv);
  float wavePressure = currentSample.r;
  float waveVelocity = currentSample.g;
  float inkIntensity = currentSample.b;

  float rNeigh = texture2D(uSimulationTexture, vUv + vec2(delta.x, 0.0)).r;
  float lNeigh = texture2D(uSimulationTexture, vUv + vec2(-delta.x, 0.0)).r;
  float uNeigh = texture2D(uSimulationTexture, vUv + vec2(0.0, delta.y)).r;
  float dNeigh = texture2D(uSimulationTexture, vUv + vec2(0.0, -delta.y)).r;

  float laplacian = (rNeigh + lNeigh + uNeigh + dNeigh) - 4.0 * wavePressure;
  waveVelocity += laplacian * 0.25;
  waveVelocity -= uSpringForce * wavePressure;
  wavePressure += waveVelocity;
  waveVelocity *= uDamp;
  wavePressure *= 0.99;

  vec2 aspectUV = vUv; aspectUV.x *= uAspect;
  vec2 p1 = uPointer; p1.x *= uAspect;
  vec2 p0 = uPrevPointer; p0.x *= uAspect;

  float dist = segmentDist(aspectUV, p0, p1);
  if (uIsPointerActive > 0.5 && dist < uBrushRadius) {
    float impulse = 1.0 - (dist / uBrushRadius);
    wavePressure += impulse * 0.45;
    inkIntensity += impulse * 0.28;
  }

  gl_FragColor = vec4(wavePressure, waveVelocity, inkIntensity * 0.96, 1.0);
}
`

const renderVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const renderFragmentShader = `
uniform sampler2D uFluidState;
uniform sampler2D uTextureInitial;
uniform sampler2D uTextureHover;
uniform float     uCrossfadeBlend;
uniform float     uRefractPower;
uniform float     uDitherSize;
uniform float     uPixelDensity;
varying vec2      vUv;

float computeBayer(vec2 screenPos) {
  vec2 block = floor(mod(screenPos / max(uDitherSize, 1.0), 4.0));
  int idx = int(block.y) * 4 + int(block.x);
  
  if (idx == 0) return 0.0625;
  if (idx == 1) return 0.5625;
  if (idx == 2) return 0.1875;
  if (idx == 3) return 0.6875;
  if (idx == 4) return 0.8125;
  if (idx == 5) return 0.3125;
  if (idx == 6) return 0.9375;
  if (idx == 7) return 0.4375;
  if (idx == 8) return 0.2500;
  if (idx == 9) return 0.7500;
  if (idx == 10) return 0.1250;
  if (idx == 11) return 0.6250;
  if (idx == 12) return 1.0000;
  if (idx == 13) return 0.5000;
  if (idx == 14) return 0.8750;
  return 0.3750;
}

void main() {
  vec2 pixelatedUv = floor(vUv * uPixelDensity) / uPixelDensity;
  vec4 fluidData = texture2D(uFluidState, pixelatedUv);
  
  vec2 displacement = vec2(fluidData.r - fluidData.g) * uRefractPower * 0.04;
  vec2 finalUv = clamp(pixelatedUv + displacement, 0.0, 1.0);

  vec4 colA = texture2D(uTextureInitial, finalUv);
  vec4 colB = texture2D(uTextureHover, finalUv);

  vec4 blended = mix(colA, colB, uCrossfadeBlend);

  float ditherVal = computeBayer(gl_FragCoord.xy);
  float luma = dot(blended.rgb, vec3(0.299, 0.587, 0.114));
  float ditheredMask = step(ditherVal * 0.3, luma);

  vec3 stylizedOutput = mix(blended.rgb * 0.85, blended.rgb * 1.15, ditheredMask);
  gl_FragColor = vec4(stylizedOutput, 1.0);
}
`

export function FluidCrossfade({
  imageA,
  imageB,
  alt = 'Fluid crossfade transition',
  ditherGrid = 3.0,
  pixelGridSize = 240,
  refractionStrength = 0.85,
  aspectRatio = 16 / 9,
  className,
}: FluidCrossfadeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const mousePos = React.useRef({ x: 0.5, y: 0.5 })
  const prevMousePos = React.useRef({ x: 0.5, y: 0.5 })
  const isPointerInside = React.useRef(false)
  const blendTarget = React.useRef(0.0)

  React.useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2))

    const simRes = new THREE.Vector2(128, 128)
    const renderTargetOptions = {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    }
    let targetA = new THREE.WebGLRenderTarget(simRes.x, simRes.y, renderTargetOptions)
    let targetB = new THREE.WebGLRenderTarget(simRes.x, simRes.y, renderTargetOptions)

    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const simScene = new THREE.Scene()
    const simGeo = new THREE.PlaneGeometry(2, 2)

    const simUniforms = {
      uSimulationTexture: { value: targetA.texture },
      uGridResolution: { value: simRes },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPrevPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uIsPointerActive: { value: 0.0 },
      uAspect: { value: aspectRatio },
      uDamp: { value: 0.96 },
      uSpringForce: { value: 0.08 },
      uBrushRadius: { value: 0.08 },
    }
    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: simVertexShader,
      fragmentShader: simFragmentShader,
      uniforms: simUniforms,
    })
    simScene.add(new THREE.Mesh(simGeo, simMaterial))

    // Main display pass
    const mainCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
    mainCamera.position.z = 1
    const mainScene = new THREE.Scene()
    const mainGeo = new THREE.PlaneGeometry(1, 1)

    const toSafeUrl = (url: string) => {
      if (!url) return url
      if (url.startsWith('blob:') || url.startsWith('data:')) return url
      try {
        return getOptimizedImageUrl(url, { width: 1600 })
      } catch {
        return url
      }
    }

    const loader = new THREE.TextureLoader()
    const texA = loader.load(toSafeUrl(imageA))
    const texB = loader.load(toSafeUrl(imageB))
    texA.minFilter = texA.magFilter = THREE.LinearFilter
    texB.minFilter = texB.magFilter = THREE.LinearFilter

    const mainUniforms = {
      uFluidState: { value: targetA.texture },
      uTextureInitial: { value: texA },
      uTextureHover: { value: texB },
      uCrossfadeBlend: { value: 0.0 },
      uRefractPower: { value: refractionStrength },
      uDitherSize: { value: ditherGrid },
      uPixelDensity: { value: pixelGridSize },
    }

    const mainMaterial = new THREE.ShaderMaterial({
      vertexShader: renderVertexShader,
      fragmentShader: renderFragmentShader,
      uniforms: mainUniforms,
    })
    mainScene.add(new THREE.Mesh(mainGeo, mainMaterial))

    let animId = 0
    const render = () => {
      animId = requestAnimationFrame(render)

      // 1. Simulation step
      simUniforms.uPointer.value.set(mousePos.current.x, mousePos.current.y)
      simUniforms.uPrevPointer.value.set(prevMousePos.current.x, prevMousePos.current.y)
      simUniforms.uIsPointerActive.value = isPointerInside.current ? 1.0 : 0.0
      prevMousePos.current = { ...mousePos.current }

      simUniforms.uSimulationTexture.value = targetA.texture
      renderer.setRenderTarget(targetB)
      renderer.render(simScene, simCamera)
      renderer.setRenderTarget(null)

      // Swap ping-pong FBOs
      const temp = targetA
      targetA = targetB
      targetB = temp

      // 2. Display step
      mainUniforms.uFluidState.value = targetA.texture
      mainUniforms.uCrossfadeBlend.value += (blendTarget.current - mainUniforms.uCrossfadeBlend.value) * 0.08
      renderer.render(mainScene, mainCamera)
    }
    render()

    const updateSize = () => {
      const w = container.clientWidth
      const h = container.clientHeight || w / aspectRatio
      renderer.setSize(w, h)
      simUniforms.uAspect.value = w / max(h, 1)
    }
    const ro = new ResizeObserver(updateSize)
    ro.observe(container)

    function max(a: number, b: number) {
      return a > b ? a : b
    }

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      simGeo.dispose()
      simMaterial.dispose()
      targetA.dispose()
      targetB.dispose()
      mainGeo.dispose()
      mainMaterial.dispose()
      texA.dispose()
      texB.dispose()
      renderer.dispose()
    }
  }, [imageA, imageB, ditherGrid, pixelGridSize, refractionStrength, aspectRatio])

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mousePos.current = {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: 1.0 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    }
  }

  return (
    <div
      ref={containerRef}
      onPointerEnter={() => {
        isPointerInside.current = true
        blendTarget.current = 1.0
      }}
      onPointerLeave={() => {
        isPointerInside.current = false
        blendTarget.current = 0.0
      }}
      onPointerMove={handlePointerMove}
      className={cn('relative w-full overflow-hidden select-none', className)}
      style={{ aspectRatio: `${aspectRatio}` }}
      aria-label={alt}
      role="img"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
