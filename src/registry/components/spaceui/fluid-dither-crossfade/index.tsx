'use client'

import * as React from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { cn } from '@/registry/lib/utils'
import { getOptimizedImageUrl } from '@/registry/lib/next-image-url'
import { logger } from '@/registry/utils/logger'

export interface FluidDitherCrossfadeProps {
  imageA?: string
  imageB?: string
  bgColor?: string
  pixelRes?: number
  pixelEdgeRes?: number
  ditherGrid?: number
  ditherEnabled?: boolean
  brushSize?: number
  distortionStrength?: number
  inkDissipation?: number
  edgeThreshold?: number
  animateEntrance?: boolean
  /** Entrance style: the original staggered column wipe, a blur/scale morph, or a pixelated sweep. @default 'stagger' */
  revealStyle?: 'stagger' | 'blur' | 'pixelate'
  revealAccentColor?: string
  revealGridDensity?: number
  revealBandWidth?: number
  revealNoiseIntensity?: number
  aspectRatio?: number
  className?: string
}

const waveSimVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const waveSimFragment = `
uniform sampler2D uWaveTexture;
uniform vec2 uScreenSize;
uniform vec2 uCursor;
uniform vec2 uPrevCursor;
uniform vec2 uMotionVelocity;
uniform float uRatio;
uniform float uDampingFactor;
uniform float uSpringTension;
uniform float uRadiusBrush;
uniform float uImpulsePush;
uniform float uInkFading;
uniform float uCursorActive;
varying vec2 vUv;

float lineDistance(vec2 pt, vec2 startPt, vec2 endPt) {
  vec2 seg = endPt - startPt;
  vec2 diff = pt - startPt;
  float t = clamp(dot(diff, seg) / max(dot(seg, seg), 0.00001), 0.0, 1.0);
  return length(diff - seg * t);
}

void main() {
  vec2 unitStep = 1.0 / uScreenSize;
  vec4 cellData = texture2D(uWaveTexture, vUv);
  float pressure = cellData.r;
  float velocity = cellData.g;
  float inkChannel = cellData.b;

  float pRight = texture2D(uWaveTexture, vUv + vec2(unitStep.x, 0.0)).r;
  float pLeft  = texture2D(uWaveTexture, vUv - vec2(unitStep.x, 0.0)).r;
  float pUp    = texture2D(uWaveTexture, vUv + vec2(0.0, unitStep.y)).r;
  float pDown  = texture2D(uWaveTexture, vUv - vec2(0.0, unitStep.y)).r;

  float laplacian = (pRight + pLeft + pUp + pDown) - 4.0 * pressure;
  velocity += laplacian * 0.25;
  velocity -= uSpringTension * pressure;
  pressure += velocity;
  velocity *= uDampingFactor;
  pressure *= 0.99;

  vec2 aspectUV = vUv; aspectUV.x *= uRatio;
  vec2 curM = uCursor; curM.x *= uRatio;
  vec2 prvM = uPrevCursor; prvM.x *= uRatio;

  float strokeDist = lineDistance(aspectUV, prvM, curM);

  if (uCursorActive > 0.5 && strokeDist < uRadiusBrush) {
    float strength = 1.0 - (strokeDist / uRadiusBrush);
    pressure += strength * 0.5;
    velocity += length(uMotionVelocity) * uImpulsePush * strength;
    inkChannel = min(inkChannel + strength * 0.5, 1.0);
  }

  inkChannel *= uInkFading;
  gl_FragColor = vec4(pressure, velocity, inkChannel, 1.0);
}
`

const compositeVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const compositeFragment = `
uniform sampler2D uWaveState;
uniform sampler2D uTextureBase;
uniform sampler2D uTextureTarget;
uniform vec2 uResolution;
uniform float uRefractIndex;
uniform float uWarpIntensity;
uniform float uWarpScale;
uniform float uPixelGrid;
uniform float uEnablePixel;
uniform float uEnableDither;
uniform float uDitherGridSize;
uniform float uPaletteDepth;
uniform vec3 uBackgroundTone;
uniform float uMaskPixelRes;
uniform float uThresholdEdge;
uniform vec4 uAspectResolution;
uniform vec3 uStaggerProg1;
uniform vec3 uStaggerProg2;
uniform float uPixelRevealOn;
uniform float uPixelRevealProgress;
uniform vec3 uPixelAccentColor;
uniform float uPixelCellDensity;
uniform float uPixelJitter;
uniform float uPixelBand;

varying vec2 vUv;

float pixelHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 computeCoverUv(vec2 uv) {
  float quadAspect = uAspectResolution.x / max(uAspectResolution.y, 1.0);
  float imgAspect = uAspectResolution.z / max(uAspectResolution.w, 1.0);
  vec2 ratio;
  if (quadAspect < imgAspect) {
    ratio = vec2(quadAspect / imgAspect, 1.0);
  } else {
    ratio = vec2(1.0, imgAspect / quadAspect);
  }
  return (uv - 0.5) * ratio + 0.5;
}

float sampleBayer4x4(vec2 screenPos) {
  vec2 coord = floor(mod(screenPos / max(uDitherGridSize, 1.0), 4.0));
  int idx = int(coord.y) * 4 + int(coord.x);
  if (idx == 0) return 0.0625;
  if (idx == 1) return 0.5625;
  if (idx == 2) return 0.1875;
  if (idx == 3) return 0.6875;
  if (idx == 4) return 0.8125;
  if (idx == 5) return 0.3125;
  if (idx == 6) return 0.9375;
  if (idx == 7) return 0.4375;
  if (idx == 8) return 0.25;
  if (idx == 9) return 0.75;
  if (idx == 10) return 0.125;
  if (idx == 11) return 0.625;
  if (idx == 12) return 1.0;
  if (idx == 13) return 0.5;
  if (idx == 14) return 0.875;
  return 0.375;
}

float evalStagger(float u) {
  float w = 0.003;
  float p0 = uStaggerProg1.x;
  float p1 = uStaggerProg1.y;
  float p2 = uStaggerProg1.z;
  float p3 = uStaggerProg2.x;
  float p4 = uStaggerProg2.y;
  float p5 = uStaggerProg2.z;

  float b0 = 0.140625;
  float b1 = 0.296875;
  float b2 = 0.4921875;
  float b3 = 0.6484375;
  float b4 = 0.8359375;

  if (u < b0 - w) return p0;
  if (u < b0 + w) return mix(p0, p1, smoothstep(b0 - w, b0 + w, u));
  if (u < b1 - w) return p1;
  if (u < b1 + w) return mix(p1, p2, smoothstep(b1 - w, b1 + w, u));
  if (u < b2 - w) return p2;
  if (u < b2 + w) return mix(p2, p3, smoothstep(b2 - w, b2 + w, u));
  if (u < b3 - w) return p3;
  if (u < b3 + w) return mix(p3, p4, smoothstep(b3 - w, b3 + w, u));
  if (u < b4 - w) return p4;
  if (u < b4 + w) return mix(p4, p5, smoothstep(b4 - w, b4 + w, u));
  return p5;
}

void main() {
  vec2 stepUnit = 1.0 / uResolution;
  float centerP = texture2D(uWaveState, vUv).r;
  float rightP  = texture2D(uWaveState, vUv + vec2(stepUnit.x, 0.0)).r;
  float upP     = texture2D(uWaveState, vUv + vec2(0.0, stepUnit.y)).r;

  vec2 baseUv = computeCoverUv(vUv);
  float prog = evalStagger(baseUv.x);
  float yShift = 1.0 - prog;

  vec2 animUvA = vec2(baseUv.x, baseUv.y + yShift);
  vec4 colBase = texture2D(uTextureBase, clamp(animUvA, 0.0, 1.0));
  colBase.a *= prog * step(0.0, animUvA.y) * step(animUvA.y, 1.0);

  vec2 refractShift = vec2(rightP - centerP, upP - centerP) * uRefractIndex * uWarpIntensity;
  vec2 targetUv = (uEnablePixel > 0.5) ? floor(baseUv * uPixelGrid) / uPixelGrid : baseUv;
  vec2 warpedUv = targetUv - (refractShift * uWarpScale);
  vec2 animUvB  = vec2(warpedUv.x, warpedUv.y + yShift);

  vec4 rawTarget = texture2D(uTextureTarget, clamp(animUvB, 0.0, 1.0));
  rawTarget.a *= prog * step(0.0, animUvB.y) * step(animUvB.y, 1.0);

  vec3 colTarget = rawTarget.rgb;
  colTarget = floor(colTarget * uPaletteDepth) / uPaletteDepth;

  if (uEnableDither > 0.5) {
    float luminance = dot(colTarget, vec3(0.299, 0.587, 0.114));
    if (luminance < sampleBayer4x4(gl_FragCoord.xy)) {
      colTarget *= 0.8;
    }
  }

  vec2 inkBlockUv = floor(vUv * uMaskPixelRes) / uMaskPixelRes;
  float inkStrength = texture2D(uWaveState, inkBlockUv).b;
  float transitionMask = step(uThresholdEdge, inkStrength);

  vec4 bgVec = vec4(uBackgroundTone, 1.0);
  vec4 compositedA = mix(bgVec, colBase, colBase.a);
  vec4 compositedB = mix(bgVec, vec4(colTarget, 1.0), rawTarget.a);

  vec4 finalColor = mix(compositedA, compositedB, transitionMask);

  if (uPixelRevealOn > 0.5) {
    float quadAspect = uAspectResolution.x / max(uAspectResolution.y, 1.0);
    vec2 cellIndex = floor(vec2(vUv.x * quadAspect, vUv.y) * uPixelCellDensity);
    float sweepAxis = 1.0 - (cellIndex.y / uPixelCellDensity);

    float noiseA = (pixelHash(cellIndex) - 0.5) * 2.0;
    float noiseB = (pixelHash(cellIndex + vec2(19.1, 7.3)) - 0.5) * 2.0;
    float wavefront = sweepAxis + (noiseA + noiseB * 0.35) * uPixelJitter;
    float band = uPixelBand / uPixelCellDensity;

    if (wavefront > uPixelRevealProgress + band) {
      discard;
    } else if (wavefront > uPixelRevealProgress - band) {
      float flash = pixelHash(cellIndex) * 0.25 + 0.75;
      gl_FragColor = vec4(uPixelAccentColor * flash, 1.0);
      return;
    }
  }

  gl_FragColor = finalColor;
}
`

export function FluidDitherCrossfade({
  imageA = 'https://cdn.spaceui.one/atom/samples/image-0-f.png',
  imageB = 'https://cdn.spaceui.one/atom/samples/image-0-b.png',
  bgColor = '#0e0e0e',
  pixelRes = 150,
  pixelEdgeRes = 80,
  ditherGrid = 20,
  ditherEnabled = true,
  brushSize = 0.3,
  distortionStrength = 9.18,
  inkDissipation = 0.926,
  edgeThreshold = 0.08,
  animateEntrance = true,
  revealStyle = 'stagger',
  revealAccentColor = bgColor,
  revealGridDensity = 40,
  revealBandWidth = 3.5,
  revealNoiseIntensity = 0.16,
  aspectRatio,
  className,
}: FluidDitherCrossfadeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isAliveRef = React.useRef(true)
  const [naturalAspect, setNaturalAspect] = React.useState<number | null>(aspectRatio ?? null)
  const [containerHeight, setContainerHeight] = React.useState<number | undefined>(undefined)

  React.useEffect(() => {
    isAliveRef.current = true
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    })
    THREE.ColorManagement.enabled = false
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.style.opacity = '0'
    const initialWidth = container.clientWidth || 300
    renderer.setSize(initialWidth, initialWidth * (9 / 16))
    container.appendChild(renderer.domElement)

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const bgCol = new THREE.Color(bgColor)

    const simScene = new THREE.Scene()
    const dispScene = new THREE.Scene()
    const planeGeo = new THREE.PlaneGeometry(2, 2)

    const simMat = new THREE.ShaderMaterial({
      vertexShader: waveSimVertex,
      fragmentShader: waveSimFragment,
      uniforms: {
        uWaveTexture: { value: null },
        uScreenSize: { value: new THREE.Vector2(1, 1) },
        uCursor: { value: new THREE.Vector2(0.5, 0.5) },
        uPrevCursor: { value: new THREE.Vector2(0.5, 0.5) },
        uMotionVelocity: { value: new THREE.Vector2(0, 0) },
        uRatio: { value: 1 },
        uDampingFactor: { value: 0.93 },
        uSpringTension: { value: 0.005 },
        uRadiusBrush: { value: brushSize },
        uImpulsePush: { value: 2.18 },
        uInkFading: { value: inkDissipation },
        uCursorActive: { value: 0.0 },
      },
    })

    const useStaggerReveal = animateEntrance && revealStyle === 'stagger'
    const useBlurReveal = animateEntrance && revealStyle === 'blur'
    const usePixelReveal = animateEntrance && revealStyle === 'pixelate'
    const initialProg = useStaggerReveal ? 0.0 : 1.0
    const revealAccentVec = new THREE.Color(revealAccentColor)
    const dispMat = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: compositeVertex,
      fragmentShader: compositeFragment,
      uniforms: {
        uWaveState: { value: null },
        uTextureBase: { value: null },
        uTextureTarget: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uAspectResolution: { value: new THREE.Vector4(1, 1, 1, 1) },
        uRefractIndex: { value: 0.072 },
        uWarpIntensity: { value: distortionStrength },
        uWarpScale: { value: 0.72 },
        uPixelGrid: { value: pixelRes },
        uEnablePixel: { value: 1.0 },
        uEnableDither: { value: ditherEnabled ? 1.0 : 0.0 },
        uDitherGridSize: { value: ditherGrid },
        uPaletteDepth: { value: 256.0 },
        uBackgroundTone: { value: new THREE.Vector3(bgCol.r, bgCol.g, bgCol.b) },
        uMaskPixelRes: { value: pixelEdgeRes },
        uThresholdEdge: { value: edgeThreshold },
        uStaggerProg1: { value: new THREE.Vector3(initialProg, initialProg, initialProg) },
        uStaggerProg2: { value: new THREE.Vector3(initialProg, initialProg, initialProg) },
        uPixelRevealOn: { value: usePixelReveal ? 1.0 : 0.0 },
        uPixelRevealProgress: { value: -0.5 },
        uPixelAccentColor: { value: revealAccentVec },
        uPixelCellDensity: { value: revealGridDensity },
        uPixelJitter: { value: revealNoiseIntensity },
        uPixelBand: { value: revealBandWidth },
      },
    })

    simScene.add(new THREE.Mesh(planeGeo, simMat))
    dispScene.add(new THREE.Mesh(planeGeo, dispMat))

    let rtA = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.FloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    })
    let rtB = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.FloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    })

    const mouseTarget = new THREE.Vector2(0.5, 0.5)
    const mouseCurrent = new THREE.Vector2(0.5, 0.5)
    const mousePrev = new THREE.Vector2(0.5, 0.5)
    const velocity = new THREE.Vector2(0, 0)
    let isMoving = false

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || window.innerWidth
      const texA = dispMat.uniforms.uTextureBase.value as THREE.Texture | null
      const imgA = texA?.image as HTMLImageElement | undefined

      const activeRatio =
        aspectRatio ?? naturalAspect ?? (imgA && imgA.width && imgA.height ? imgA.width / imgA.height : undefined)

      let h: number
      if (activeRatio) {
        h = w / activeRatio
      } else if (container.clientHeight && container.clientHeight > 50) {
        h = container.clientHeight
      } else {
        h = w * (9 / 16)
      }

      const imgW = imgA?.width || w
      const imgH = imgA?.height || h
      dispMat.uniforms.uAspectResolution.value.set(w, h, imgW, imgH)

      setContainerHeight(h)
      renderer.setSize(w, h)
      const dpr = Math.min(window.devicePixelRatio, 2)
      renderer.setPixelRatio(dpr)
      const rw = w * dpr
      const rh = h * dpr
      rtA.setSize(rw, rh)
      rtB.setSize(rw, rh)
      simMat.uniforms.uScreenSize.value.set(rw, rh)
      dispMat.uniforms.uResolution.value.set(rw, rh)

      if (activeRatio) {
        simMat.uniforms.uRatio.value = activeRatio
      } else {
        simMat.uniforms.uRatio.value = w / Math.max(h, 1)
      }
    }

    const cleanA = imageA && !imageA.includes('footer') ? imageA : 'https://cdn.spaceui.one/atom/samples/image-0-f.png'
    const cleanB = imageB && !imageB.includes('footer') ? imageB : 'https://cdn.spaceui.one/atom/samples/image-0-b.png'

    const toSafeUrl = (url: string) => {
      if (!url) return url
      if (url.startsWith('blob:') || url.startsWith('data:')) return url
      try {
        return getOptimizedImageUrl(url, { width: 1600 })
      } catch {
        return url
      }
    }

    // Load textures safely using getOptimizedImageUrl with blob and local fallbacks
    const loadSafe = (url: string): Promise<THREE.Texture> =>
      new Promise((resolve, reject) => {
        const optimizedUrl = toSafeUrl(url)
        const img = new Image()
        if (!optimizedUrl.startsWith('blob:') && !optimizedUrl.startsWith('data:') && !optimizedUrl.startsWith('/')) {
          img.crossOrigin = 'anonymous'
        }
        img.onload = () => {
          const tex = new THREE.Texture(img)
          tex.needsUpdate = true
          resolve(tex)
        }
        img.onerror = () => {
          const fallbackImg = new Image()
          if (!url.startsWith('blob:') && !url.startsWith('data:') && !url.startsWith('/')) {
            fallbackImg.crossOrigin = 'anonymous'
          }
          fallbackImg.onload = () => {
            const tex = new THREE.Texture(fallbackImg)
            tex.needsUpdate = true
            resolve(tex)
          }
          fallbackImg.onerror = () => {
            const fileName = url.split('/').pop()?.split('?')[0]
            if (fileName && !url.includes('/samples/')) {
              const localImg = new Image()
              localImg.onload = () => {
                const tex = new THREE.Texture(localImg)
                tex.needsUpdate = true
                resolve(tex)
              }
              localImg.onerror = (e) => reject(e)
              localImg.src = `/samples/${fileName}`
              return
            }
            reject(new Error(`Failed to load ${url}`))
          }
          fallbackImg.src = url
        }
        img.src = optimizedUrl
      })

    Promise.all([loadSafe(cleanA), loadSafe(cleanB)])
      .then(([tA, tB]) => {
        if (!isAliveRef.current) return
        tA.colorSpace = THREE.NoColorSpace
        tB.colorSpace = THREE.NoColorSpace
        dispMat.uniforms.uTextureBase.value = tA
        dispMat.uniforms.uTextureTarget.value = tB
        if (tA && tA.image) {
          const img = tA.image as HTMLImageElement
          if (img.width && img.height) {
            setNaturalAspect(img.width / img.height)
          }
        }
        handleResize()
        renderer.domElement.style.opacity = '1'

        if (useStaggerReveal) {
          const letterProgs = [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }]
          letterProgs.forEach((obj, i) => {
            const delay = i * 150
            const duration = 1700
            const startTime = performance.now() + delay
            const animate = () => {
              if (!isAliveRef.current) return
              const elapsed = performance.now() - startTime
              if (elapsed < 0) {
                requestAnimationFrame(animate)
                return
              }
              const t = Math.min(elapsed / duration, 1)
              const eased = t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2
              obj.v = t === 0 ? 0 : t === 1 ? 1 : eased
              dispMat.uniforms.uStaggerProg1.value.set(letterProgs[0].v, letterProgs[1].v, letterProgs[2].v)
              dispMat.uniforms.uStaggerProg2.value.set(letterProgs[3].v, letterProgs[4].v, letterProgs[5].v)
              if (t < 1) requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
          })
        } else if (useBlurReveal) {
          gsap.set(renderer.domElement, { scale: 1.04, opacity: 0, filter: 'blur(18px)' })
          entranceTween = gsap.to(renderer.domElement, {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.1,
            ease: 'power3.out',
          })
        } else if (usePixelReveal) {
          const state = { p: -0.5 }
          entranceTween = gsap.to(state, {
            p: 1.35,
            duration: 1.4,
            ease: 'power2.out',
            onUpdate: () => {
              dispMat.uniforms.uPixelRevealProgress.value = state.p
            },
          })
        }
      })
      .catch((err) => {
        logger.warn('FluidDitherCrossfade: primary texture load failed, trying fallback', err)
        if (!isAliveRef.current) return
        Promise.all([
          loadSafe('https://cdn.spaceui.one/atom/samples/image-0-f.png'),
          loadSafe('https://cdn.spaceui.one/atom/samples/image-0-b.png'),
        ])
          .then(([tA, tB]) => {
            if (!isAliveRef.current) return
            tA.colorSpace = THREE.NoColorSpace
            tB.colorSpace = THREE.NoColorSpace
            dispMat.uniforms.uTextureBase.value = tA
            dispMat.uniforms.uTextureTarget.value = tB
            handleResize()
            renderer.domElement.style.opacity = '1'
          })
          .catch((e) => {
            logger.error('FluidDitherCrossfade: fallback texture load also failed', e)
          })
      })

    let entranceTween: gsap.core.Tween | null = null
    let idleTimer: ReturnType<typeof setTimeout>
    const handlePointerEnter = () => {
      isMoving = true
    }
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseTarget.set((e.clientX - rect.left) / rect.width, 1.0 - (e.clientY - rect.top) / rect.height)
      isMoving = true
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        isMoving = false
      }, 750)
    }
    const handlePointerLeave = () => {
      isMoving = false
      clearTimeout(idleTimer)
    }

    container.addEventListener('mouseenter', handlePointerEnter)
    container.addEventListener('mousemove', handlePointerMove)
    container.addEventListener('mouseleave', handlePointerLeave)

    let rafId = 0
    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop)

      mousePrev.copy(mouseCurrent)
      mouseCurrent.lerp(mouseTarget, 0.08)
      velocity.subVectors(mouseCurrent, mousePrev)

      // Simulation pass
      simMat.uniforms.uCursorActive.value = isMoving ? 1.0 : 0.0
      simMat.uniforms.uCursor.value.copy(mouseCurrent)
      simMat.uniforms.uPrevCursor.value.copy(mousePrev)
      simMat.uniforms.uMotionVelocity.value.copy(velocity)
      simMat.uniforms.uWaveTexture.value = rtA.texture

      renderer.setRenderTarget(rtB)
      renderer.render(simScene, camera)

      // Composite pass
      dispMat.uniforms.uWaveState.value = rtB.texture
      renderer.setRenderTarget(null)
      renderer.render(dispScene, camera)

      // Swap FBO
      const temp = rtA
      rtA = rtB
      rtB = temp
    }
    renderLoop()

    window.addEventListener('resize', handleResize)
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      isAliveRef.current = false
      cancelAnimationFrame(rafId)
      entranceTween?.kill()
      clearTimeout(idleTimer)
      container.removeEventListener('mouseenter', handlePointerEnter)
      container.removeEventListener('mousemove', handlePointerMove)
      container.removeEventListener('mouseleave', handlePointerLeave)
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      rtA.dispose()
      rtB.dispose()
      planeGeo.dispose()
      simMat.dispose()
      dispMat.dispose()
    }
  }, [
    imageA,
    imageB,
    bgColor,
    pixelRes,
    pixelEdgeRes,
    ditherGrid,
    ditherEnabled,
    brushSize,
    distortionStrength,
    inkDissipation,
    edgeThreshold,
    animateEntrance,
    revealStyle,
    revealAccentColor,
    revealGridDensity,
    revealBandWidth,
    revealNoiseIntensity,
    aspectRatio,
  ])

  const activeAspect = aspectRatio ?? naturalAspect

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full overflow-hidden select-none', className)}
      style={{
        aspectRatio: activeAspect ? `${activeAspect}` : undefined,
        height: activeAspect ? undefined : containerHeight || undefined,
      }}
    />
  )
}
