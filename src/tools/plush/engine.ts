// @ts-nocheck
import * as THREE from 'three'
import { aD, aO, aF, aB, blurFrag } from './shaders'
import { isAPNG, parseAPNG, APNGPlayer } from './apng'
import { generateDistanceMap } from './distance-map'
import { analyzeArtwork, detectEdgeColor, extractDominantPalette } from './color-detect'
import type { PlushConfig, ArtworkData } from './types'

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))

export function buildCushionGeometries(roundness: number, cornerRadius: number, puffiness: number, isMobile: boolean) {
  const baseGeom = new THREE.BoxGeometry(2, 2, 2, 70, 70, 26)
  const posAttr = baseGeom.getAttribute('position')
  const tmpV = new THREE.Vector3()
  const powSign = (v: number, p: number) => Math.sign(v) * Math.pow(Math.abs(v), p)

  const rRound = clamp(roundness, 0, 1)
  const cRadius = clamp(cornerRadius, 0.06, 0.45)
  const pPuff = clamp(puffiness, 0, 1)

  for (let i = 0; i < posAttr.count; i++) {
    tmpV.fromBufferAttribute(posAttr, i)

    let bx = tmpV.x
    let by = tmpV.y
    const bz = tmpV.z
    const signX = Math.sign(bx) || 1
    const signY = Math.sign(by) || 1
    const absX = Math.abs(bx)
    const absY = Math.abs(by)
    const threshold = 1.0 - cRadius

    if (absX > threshold && absY > threshold) {
      const cx = signX * threshold
      const cy = signY * threshold
      const dx = bx - cx
      const dy = by - cy
      const dist = Math.hypot(dx, dy)
      if (dist > 0.0001) {
        const factor = cRadius / Math.max(dist, cRadius)
        bx = cx + dx * factor
        by = cy + dy * factor
      }
    }

    const edgeDist = Math.max(absX, absY)
    const facePuff = 1.0 - 0.22 * pPuff * Math.pow(edgeDist, 2.8)

    const boxX = 1.48 * bx
    const boxY = 1.48 * by
    const boxZ = 0.68 * bz * facePuff

    tmpV.normalize()
    const sphereX = 1.5 * powSign(tmpV.x, 0.52)
    const sphereY = 1.5 * powSign(tmpV.y, 0.52)
    const sphereZ = 0.72 * powSign(tmpV.z, 0.72)

    const x = lerp(boxX, sphereX, rRound)
    const y = lerp(boxY, sphereY, rRound)
    const z = lerp(boxZ, sphereZ, rRound)

    const wobbleAmp = (0.006 + 0.008 * rRound) * (0.2 + 0.8 * pPuff)
    const noise = 1 + Math.sin(3.2 * x + 2.1 * y) * Math.cos(3 * y) * wobbleAmp
    posAttr.setXYZ(i, x, y, z * noise)
  }
  baseGeom.deleteAttribute('normal')
  baseGeom.deleteAttribute('uv')
  baseGeom.computeVertexNormals()
  baseGeom.computeBoundingSphere()

  const instanceCount = isMobile ? 85000 : 140000
  const furGeom = new THREE.InstancedBufferGeometry()
  const furPositions: number[] = []
  const furIndices: number[] = []
  for (let e = 0; e <= 4; e++) {
    furPositions.push(-1, e / 4, 0, 1, e / 4, 0)
    if (e < 4) {
      const t = 2 * e
      furIndices.push(t, t + 1, t + 2, t + 1, t + 3, t + 2)
    }
  }
  furGeom.setAttribute('position', new THREE.Float32BufferAttribute(furPositions, 3))
  furGeom.setIndex(furIndices)

  const aRoot = new Float32Array(3 * instanceCount)
  const aNormal = new Float32Array(3 * instanceCount)
  const aVariation = new Float32Array(4 * instanceCount)

  const bPos = baseGeom.getAttribute('position')
  const bNorm = baseGeom.getAttribute('normal')
  const bIndex = baseGeom.getIndex()!
  const triCount = bIndex.count / 3
  const triAreas = new Float32Array(triCount)
  const vA = new THREE.Vector3(),
    vB = new THREE.Vector3(),
    vC = new THREE.Vector3()
  const t1 = new THREE.Vector3(),
    t2 = new THREE.Vector3()
  let totalArea = 0

  for (let i = 0; i < triCount; i++) {
    vA.fromBufferAttribute(bPos, bIndex.getX(3 * i))
    vB.fromBufferAttribute(bPos, bIndex.getX(3 * i + 1))
    vC.fromBufferAttribute(bPos, bIndex.getX(3 * i + 2))
    totalArea += 0.5 * t1.subVectors(vB, vA).cross(t2.subVectors(vC, vA)).length()
    triAreas[i] = totalArea
  }

  let seed = 834721
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0
    return (seed >>> 0) / 4294967296
  }

  const vN1 = new THREE.Vector3(),
    vN2 = new THREE.Vector3(),
    vN3 = new THREE.Vector3()
  const nTmp = new THREE.Vector3(),
    pTmp = new THREE.Vector3()

  for (let i = 0; i < instanceCount; i++) {
    const rA = rand() * totalArea
    let left = 0,
      right = triCount - 1
    while (left < right) {
      const mid = (left + right) >>> 1
      if (triAreas[mid] < rA) left = mid + 1
      else right = mid
    }
    const tri = left
    const iA = bIndex.getX(3 * tri),
      iB = bIndex.getX(3 * tri + 1),
      iC = bIndex.getX(3 * tri + 2)
    const r1 = Math.sqrt(rand()),
      r2 = rand()

    vA.fromBufferAttribute(bPos, iA)
    vB.fromBufferAttribute(bPos, iB)
    vC.fromBufferAttribute(bPos, iC)
    pTmp
      .copy(vA)
      .multiplyScalar(1 - r1)
      .addScaledVector(vB, r1 * (1 - r2))
      .addScaledVector(vC, r1 * r2)

    vN1.fromBufferAttribute(bNorm, iA).multiplyScalar(1 - r1)
    vN2.fromBufferAttribute(bNorm, iB)
    vN3.fromBufferAttribute(bNorm, iC)
    nTmp
      .copy(vN1)
      .addScaledVector(vN2, r1 * (1 - r2))
      .addScaledVector(vN3, r1 * r2)
      .normalize()

    const rimDist = Math.max(Math.abs(pTmp.x), Math.abs(pTmp.y))
    const cornerDist = Math.abs(pTmp.x) + Math.abs(pTmp.y)

    if (rimDist > 0.75) {
      const outward = new THREE.Vector3(pTmp.x, pTmp.y, pTmp.z * 0.35).normalize()
      const cornerWeight = clamp((cornerDist - 1.7) / 0.8, 0, 1)
      const rimWeight = clamp((rimDist - 0.75) / 0.65, 0, 1) * 0.35
      const blend = Math.max(rimWeight, cornerWeight * 0.8)
      nTmp.lerp(outward, blend).normalize()
    }

    pTmp.toArray(aRoot, i * 3)
    nTmp.toArray(aNormal, i * 3)
    aVariation.set([rand(), 0.065 + 0.085 * Math.pow(rand(), 1.5), 0.0024 + 0.0008 * rand(), rand()], i * 4)
  }

  furGeom.setAttribute('aRoot', new THREE.InstancedBufferAttribute(aRoot, 3))
  furGeom.setAttribute('aNormal', new THREE.InstancedBufferAttribute(aNormal, 3))
  furGeom.setAttribute('aVariation', new THREE.InstancedBufferAttribute(aVariation, 4))
  furGeom.instanceCount = instanceCount
  furGeom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2.4)

  return { baseGeom, furGeom }
}

const artworkPromiseCache: Record<string, Promise<ArtworkData>> = {}

export class SVGPlayer {
  private img: HTMLImageElement
  private domContainer: HTMLDivElement | null = null
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private isPlaying = false
  private animFrameId: number | null = null
  private onFrameCallback: ((canvas: HTMLCanvasElement) => void) | null = null

  constructor(svgUrl: string, width = 512, height = 512) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!

    this.img = document.createElement('img')
    this.img.crossOrigin = 'anonymous'
    this.img.src = svgUrl
    this.img.style.position = 'fixed'
    this.img.style.left = '-9999px'
    this.img.style.top = '-9999px'
    this.img.style.width = `${width}px`
    this.img.style.height = `${height}px`
    this.img.style.opacity = '0'
    this.img.style.pointerEvents = 'none'

    this.domContainer = document.createElement('div')
    this.domContainer.style.position = 'fixed'
    this.domContainer.style.left = '-9999px'
    this.domContainer.style.top = '-9999px'
    this.domContainer.style.width = '0'
    this.domContainer.style.height = '0'
    this.domContainer.style.overflow = 'hidden'
    this.domContainer.style.pointerEvents = 'none'
    this.domContainer.appendChild(this.img)
    document.body.appendChild(this.domContainer)
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  public play(onFrame: (canvas: HTMLCanvasElement) => void): () => void {
    this.onFrameCallback = onFrame
    this.isPlaying = true

    let lastTick = 0
    const frameInterval = 1000 / 30

    const loop = (now: number) => {
      if (!this.isPlaying) return

      if (now - lastTick >= frameInterval) {
        lastTick = now
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        if (this.img.complete && this.img.naturalWidth > 0) {
          this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height)
          if (this.onFrameCallback) {
            this.onFrameCallback(this.canvas)
          }
        }
      }

      this.animFrameId = requestAnimationFrame(loop)
    }

    this.animFrameId = requestAnimationFrame(loop)

    return () => {
      this.stop()
    }
  }

  public stop() {
    this.isPlaying = false
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
    if (this.domContainer && this.domContainer.parentNode) {
      this.domContainer.parentNode.removeChild(this.domContainer)
      this.domContainer = null
    }
  }
}

export async function loadPlushArtwork(
  url: string,
  id: string,
  label: string,
  defaultSideColor = '#ffffff',
): Promise<ArtworkData> {
  const cached = artworkPromiseCache[url]
  if (cached) {
    return cached
  }

  const promise = (async () => {
    let finalUrl = url
    const isSvg = url.endsWith('.svg') || url.includes('image/svg') || label.toLowerCase().endsWith('.svg')
    let isAnimatedSvg = false
    let svgPlayer: SVGPlayer | undefined

    if (isSvg) {
      try {
        const text = await fetch(url).then((res) => res.text())
        if (text.includes('<svg')) {
          const parser = new DOMParser()
          const doc = parser.parseFromString(text, 'image/svg+xml')
          const svgEl = doc.querySelector('svg')
          if (svgEl) {
            if (!svgEl.hasAttribute('xmlns')) {
              svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
            }
            const viewBox = svgEl.getAttribute('viewBox')
            let w = parseFloat(svgEl.getAttribute('width') || '0')
            let h = parseFloat(svgEl.getAttribute('height') || '0')

            if ((!w || !h || isNaN(w) || isNaN(h)) && viewBox) {
              const parts = viewBox
                .trim()
                .split(/[\s,]+/)
                .map(Number)
              if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
                w = parts[2]
                h = parts[3]
                svgEl.setAttribute('width', String(w))
                svgEl.setAttribute('height', String(h))
              }
            }
            if (!w || !h || isNaN(w) || isNaN(h)) {
              svgEl.setAttribute('width', '512')
              svgEl.setAttribute('height', '512')
              if (!viewBox) svgEl.setAttribute('viewBox', '0 0 512 512')
            }

            const hasSmil = Boolean(svgEl.querySelector('animate, animateTransform, animateMotion, set'))
            const hasKeyframes = /@keyframes|animation\s*:/i.test(text)
            isAnimatedSvg = hasSmil || hasKeyframes

            const serialized = new XMLSerializer().serializeToString(doc)
            const blob = new Blob([serialized], { type: 'image/svg+xml' })
            finalUrl = URL.createObjectURL(blob)

            if (isAnimatedSvg) {
              svgPlayer = new SVGPlayer(finalUrl, 512, 512)
            }
          }
        }
      } catch (err) {
        console.warn('SVG processing fallback:', err)
      }
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = finalUrl
    })

    if ('decode' in img && !isSvg) {
      try {
        await img.decode()
      } catch {}
    }

    const TEX_SIZE = 512
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = TEX_SIZE
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw Error('Your browser could not prepare this canvas texture.')

    const analysis = analyzeArtwork(img)

    ctx.clearRect(0, 0, TEX_SIZE, TEX_SIZE)
    let w = TEX_SIZE
    let h = TEX_SIZE
    let x = 0
    let y = 0
    if (analysis.hasAlpha) {
      const padding = 0.88
      const scale = (TEX_SIZE * padding) / Math.max(img.naturalWidth || 512, img.naturalHeight || 512)
      w = (img.naturalWidth || 512) * scale
      h = (img.naturalHeight || 512) * scale
      x = (TEX_SIZE - w) / 2
      y = (TEX_SIZE - h) / 2
    } else {
      const scale = Math.max(TEX_SIZE / (img.naturalWidth || 512), TEX_SIZE / (img.naturalHeight || 512))
      w = Math.round((img.naturalWidth || 512) * scale)
      h = Math.round((img.naturalHeight || 512) * scale)
      x = Math.round((TEX_SIZE - w) / 2)
      y = Math.round((TEX_SIZE - h) / 2)
    }
    ctx.drawImage(img, x, y, w, h)

    const edgeColor = analysis.edgeColor
    const palette = analysis.palette
    const resolvedSideColor = analysis.hasAlpha
      ? defaultSideColor && defaultSideColor !== '#ffffff'
        ? defaultSideColor
        : edgeColor
      : edgeColor

    const art: ArtworkData = {
      id,
      label,
      canvas,
      ctx,
      sideColor: resolvedSideColor,
      edgeColor,
      palette,
      preview: url,
      hasAlpha: analysis.hasAlpha,
      isAnimated: isAnimatedSvg,
      animationType: isAnimatedSvg ? 'svg' : undefined,
    }

    if (isAnimatedSvg && svgPlayer) {
      art.apngPlayer = svgPlayer
    }

    fetch(url)
      .then((res) => res.arrayBuffer())
      .then(async (buf) => {
        if (!isAnimatedSvg && isAPNG(buf)) {
          const parsed = await parseAPNG(buf)
          if (parsed) {
            art.apngPlayer = new APNGPlayer(parsed)
            art.isAnimated = true
            art.animationType = 'apng'
          }
        }
      })
      .catch((err) => {
        console.warn('Non-APNG or failed background stream:', err)
      })

    return art
  })()

  artworkPromiseCache[url] = promise
  return promise
}

export interface PlushEngineCallbacks {
  onPet?: () => void
  onPress?: () => void
  onRelease?: () => void
  onClick?: () => void
  onDragEnd?: () => void
}

export class PlushEngine {
  private container: HTMLDivElement
  private config: PlushConfig
  private callbacks?: PlushEngineCallbacks
  private zoomLevel = 1.0
  private targetZoomLevel = 1.0
  private baseCameraZ = 7.6

  private renderer!: THREE.WebGLRenderer
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderTarget!: THREE.WebGLRenderTarget
  private orthoCamera!: THREE.OrthographicCamera
  private postScene!: THREE.Scene
  private blurMat!: THREE.ShaderMaterial
  private cushionGroup!: THREE.Group
  private shadowPlane!: THREE.Mesh
  private baseMesh!: THREE.Mesh
  private furMesh!: THREE.Mesh
  private uniforms!: Record<string, THREE.IUniform>

  private activeArtwork: ArtworkData | null = null
  private activeApngStop: (() => void) | null = null
  private currentTex!: THREE.Texture
  private currentDistanceMap!: THREE.Texture
  private prevTex: THREE.Texture | null = null
  private artworkMix = 1

  private isDragging = false
  private isHovering = false
  private hasContact = false
  private pointerId: number | null = null
  private pointer = new THREE.Vector2()
  private lastPos = new THREE.Vector2()
  private dragStart = new THREE.Vector2()
  private targetRot = new THREE.Euler()
  private targetQuat = new THREE.Quaternion()
  private targetStrength = 0
  private timeAccum = 0
  private trailTime = 0
  private lastTime = performance.now()
  private animFrameId: number | null = null
  private stopRendering = false

  private raycaster = new THREE.Raycaster()
  private tmpV = new THREE.Vector3()
  private touchPos = new THREE.Vector3(0, 0, 4)
  private prevTouchPos = new THREE.Vector3()
  private strokeVec = new THREE.Vector3()

  private isMobile = false
  private isReducedMotion = false
  private geomCache: Record<string, { baseGeom: THREE.BoxGeometry; furGeom: THREE.InstancedBufferGeometry }> = {}
  private cleanupDisposables: Array<() => void> = []

  constructor(container: HTMLDivElement, initialConfig: PlushConfig, callbacks?: PlushEngineCallbacks) {
    this.container = container
    this.config = { ...initialConfig }
    this.callbacks = callbacks
    this.init()
  }

  private init() {
    this.container.innerHTML = ''
    this.isReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    })
    this.renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.12
    this.renderer.setClearColor(0xffffff, 0)

    const canvas = this.renderer.domElement
    canvas.className = 'w-full h-full block select-none touch-none outline-none'
    this.container.appendChild(canvas)

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50)
    this.camera.position.set(0, 0, 7.6)

    this.renderTarget = new THREE.WebGLRenderTarget(1, 1, {
      samples: 4,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      colorSpace: THREE.SRGBColorSpace,
    })
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    this.blurMat = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uImage: { value: this.renderTarget.texture },
        uPixel: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: blurFrag,
    })
    this.postScene = new THREE.Scene()
    this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.blurMat))

    this.cushionGroup = new THREE.Group()
    this.cushionGroup.rotation.set(0.08, -0.08, 0, 'YXZ')
    this.targetRot.copy(this.cushionGroup.rotation)
    this.targetQuat.copy(this.cushionGroup.quaternion)
    this.scene.add(this.cushionGroup)

    this.currentTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat)
    this.currentTex.needsUpdate = true

    const fallbackDist = new Uint8Array(256 * 256 * 4).fill(255)
    this.currentDistanceMap = new THREE.DataTexture(fallbackDist, 256, 256, THREE.RGBAFormat)
    this.currentDistanceMap.needsUpdate = true

    this.uniforms = {
      uArtworkMode: { value: 2 },
      uPreviousArtwork: { value: this.currentTex },
      uPreviousArtworkMode: { value: 2 },
      uPreviousSideColor: { value: new THREE.Color(this.config.sideColor) },
      uArtworkMix: { value: 1 },
      uIconOpacity: { value: this.config.iconOpacity },
      uArtwork: { value: this.currentTex },
      uDistanceMap: { value: this.currentDistanceMap },
      uSideColor: { value: new THREE.Color(this.config.sideColor) },
      uAutoColor: { value: this.config.autoColor ? 1 : 0 },
      uTime: { value: 0 },
      uTouch: { value: new THREE.Vector3(0, 0, 4) },
      uTouchNormal: { value: new THREE.Vector3(0, 0, 1) },
      uStrength: { value: 0 },
      uFurScale: { value: this.config.furSize },
      uFurThickness: { value: this.config.furThickness },
      uFurHighlight: { value: this.config.furHighlight },
      uTouchRadius: { value: this.config.handSize },
      uStroke: { value: new THREE.Vector3() },
      uTrail: { value: Array.from({ length: 5 }, () => new THREE.Vector4(0, 0, 4, 0)) },
    }

    const initialGeoms = this.getGeoms(this.config.roundness, this.config.cornerRadius, this.config.puffiness)
    const baseMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: aD,
      fragmentShader: aO,
    })
    this.baseMesh = new THREE.Mesh(initialGeoms.baseGeom, baseMat)
    this.cushionGroup.add(this.baseMesh)

    const furMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: aF,
      fragmentShader: aB,
      side: THREE.DoubleSide,
      alphaToCoverage: true,
    })
    this.furMesh = new THREE.Mesh(initialGeoms.furGeom, furMat)
    this.cushionGroup.add(this.furMesh)

    const shadowGeom = new THREE.PlaneGeometry(7, 3)
    const shadowMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uOpacity: { value: 0.2 },
        uColor: { value: new THREE.Color(0.3, 0.19, 0.44) },
      },
      vertexShader:
        'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec2 vUv; uniform float uOpacity; uniform vec3 uColor; void main() {
        vec2 p = (vUv - 0.5) * vec2(3.8, 6.0);
        float shadow = exp(-dot(p, p) * 2.4);
        gl_FragColor = vec4(uColor, shadow * uOpacity);
      }`,
    })
    this.shadowPlane = new THREE.Mesh(shadowGeom, shadowMat)
    this.shadowPlane.position.set(0, -1.7, -1.2)
    this.scene.add(this.shadowPlane)

    this.bindEvents()
    this.resize()
    this.startLoop()
  }

  private getGeoms(roundness: number, cornerRadius: number, puffiness: number) {
    const rKey = Math.round(roundness * 20) / 20
    const cKey = Math.round(cornerRadius * 20) / 20
    const pKey = Math.round(puffiness * 10) / 10
    const key = `${rKey}_${cKey}_${pKey}`

    if (!this.geomCache[key]) {
      this.geomCache[key] = buildCushionGeometries(roundness, cornerRadius, puffiness, this.isMobile)
    }
    return this.geomCache[key]
  }

  public updateConfig(newConfig: Partial<PlushConfig>) {
    Object.assign(this.config, newConfig)

    if (
      newConfig.roundness !== undefined ||
      newConfig.cornerRadius !== undefined ||
      newConfig.puffiness !== undefined
    ) {
      this.refreshGeometries()
    }

    if (newConfig.sideColor !== undefined) {
      ;(this.uniforms.uSideColor.value as THREE.Color).set(this.config.sideColor)
    }

    if (newConfig.autoColor !== undefined) {
      this.uniforms.uAutoColor.value = newConfig.autoColor ? 1 : 0
    }
  }

  public refreshGeometries() {
    const geoms = this.getGeoms(this.config.roundness, this.config.cornerRadius, this.config.puffiness)
    this.baseMesh.geometry = geoms.baseGeom
    this.furMesh.geometry = geoms.furGeom
  }

  public setArtwork(art: ArtworkData) {
    this.activeArtwork = art
    if (art.sideColor) {
      this.config.sideColor = art.sideColor
      ;(this.uniforms.uSideColor.value as THREE.Color).set(art.sideColor)
    }
    this.uniforms.uAutoColor.value = this.config.autoColor ? 1 : 0
    if (art.distanceMap) {
      this.currentDistanceMap = art.distanceMap
      this.uniforms.uDistanceMap.value = art.distanceMap
    }
  }

  private bindEvents() {
    const canvas = this.renderer.domElement

    const onPointerMove = (e: PointerEvent) => {
      if (!e.isPrimary) return
      if (this.pointerId !== null && this.pointerId !== e.pointerId) return

      const rect = canvas.getBoundingClientRect()
      this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      this.isHovering = true

      if (this.pointerId !== null) {
        if (!this.isDragging && Math.hypot(e.clientX - this.dragStart.x, e.clientY - this.dragStart.y) > 4) {
          this.isDragging = true
        }
        if (this.isDragging) {
          const dx = e.clientX - this.lastPos.x
          const dy = e.clientY - this.lastPos.y
          const factor = (0.65 * Math.PI) / Math.min(rect.width, rect.height)
          this.targetRot.y += dx * factor
          this.targetRot.x = clamp(this.targetRot.x + dy * factor, -0.42 * Math.PI, 0.42 * Math.PI)
          this.targetQuat.setFromEuler(this.targetRot)
          this.lastPos.set(e.clientX, e.clientY)
        }
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0) return
      onPointerMove(e)

      this.raycaster.setFromCamera(this.pointer, this.camera)
      const hits = this.raycaster.intersectObject(this.baseMesh, false)
      if (hits.length > 0) {
        this.pointerId = e.pointerId
        this.hasContact = true
        this.isDragging = false
        this.dragStart.set(e.clientX, e.clientY)
        this.lastPos.copy(this.dragStart)
        canvas.setPointerCapture(e.pointerId)
        this.callbacks?.onPress?.()
      }
    }

    const releasePointer = () => {
      const wasDragging = this.isDragging
      const wasContact = this.hasContact

      if (this.pointerId !== null && canvas.hasPointerCapture(this.pointerId)) {
        try {
          canvas.releasePointerCapture(this.pointerId)
        } catch {}
      }
      if (wasContact) {
        this.callbacks?.onRelease?.()
        if (wasDragging) {
          this.callbacks?.onDragEnd?.()
        } else {
          this.callbacks?.onClick?.()
        }
      }
      this.pointerId = null
      this.isHovering = false
      this.hasContact = false
      this.isDragging = false
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.isPrimary && (this.pointerId === null || this.pointerId === e.pointerId)) {
        releasePointer()
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.08 : 0.92
      this.targetZoomLevel = clamp(this.targetZoomLevel * factor, 0.4, 3.0)
    }

    let initialTouchDist: number | null = null
    let initialZoom = 1.0

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        initialTouchDist = Math.hypot(dx, dy)
        initialZoom = this.targetZoomLevel
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialTouchDist !== null) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.hypot(dx, dy)
        if (initialTouchDist > 0) {
          const ratio = dist / initialTouchDist
          this.targetZoomLevel = clamp(initialZoom * ratio, 0.4, 3.0)
        }
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialTouchDist = null
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=' || e.key === 'Add') {
          e.preventDefault()
          this.targetZoomLevel = clamp(this.targetZoomLevel * 1.15, 0.4, 3.0)
        } else if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
          e.preventDefault()
          this.targetZoomLevel = clamp(this.targetZoomLevel / 1.15, 0.4, 3.0)
        } else if (e.key === '0') {
          e.preventDefault()
          this.targetZoomLevel = 1.0
        }
      }
    }

    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('lostpointercapture', onPointerUp)
    canvas.addEventListener('pointerleave', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKeyDown)

    const onResize = () => this.resize()
    window.addEventListener('resize', onResize)

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && this.container) {
      ro = new ResizeObserver(() => this.resize())
      ro.observe(this.container)
    }

    this.cleanupDisposables.push(() => {
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('lostpointercapture', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
      if (ro) ro.disconnect()
    })
  }

  public resize() {
    if (!this.container) return
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    if (w && h) {
      this.camera.aspect = w / h
      const vFovRad = (34 * Math.PI) / 180
      const halfTan = Math.tan(vFovRad / 2)
      const targetSpan = 4.3
      const zFitV = targetSpan / (2 * halfTan)
      const zFitH = targetSpan / (2 * halfTan * this.camera.aspect)
      this.baseCameraZ = Math.max(zFitV, zFitH)
      this.camera.position.z = this.baseCameraZ / this.zoomLevel
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h, false)
      this.renderTarget.setSize(w, h)
      this.blurMat.uniforms.uPixel.value.set(1 / w, 1 / h)
    }
  }

  private startLoop() {
    let lastPetSoundTime = 0

    const renderLoop = (time: number) => {
      if (this.stopRendering) return
      const dt = Math.min((time - this.lastTime) / 1000, 1 / 30)
      this.lastTime = time
      this.timeAccum += dt
      const alpha = 1 - Math.exp(-7 * dt)
      const rm = this.isReducedMotion ? 1 : 0

      if (Math.abs(this.zoomLevel - this.targetZoomLevel) > 0.0005) {
        this.zoomLevel = lerp(this.zoomLevel, this.targetZoomLevel, this.isReducedMotion ? 1 : 1 - Math.exp(-14 * dt))
        this.camera.position.z = this.baseCameraZ / this.zoomLevel
      }

      this.cushionGroup.quaternion.slerp(this.targetQuat, this.isReducedMotion ? 1 : 1 - Math.exp(-20 * dt))
      this.cushionGroup.position.y = 0.14 + 0.035 * Math.sin(0.95 * this.timeAccum) * (1 - rm)
      this.cushionGroup.scale.setScalar(1 + 0.0035 * Math.sin(1.25 * this.timeAccum) * (1 - rm))
      this.cushionGroup.updateMatrixWorld(true)

      let touching = false
      if (this.isHovering && !this.isDragging) {
        this.raycaster.setFromCamera(this.pointer, this.camera)
        const hit = this.raycaster.intersectObject(this.baseMesh, false)[0]
        if (hit) {
          this.cushionGroup.worldToLocal(this.tmpV.copy(hit.point))
          if (hit.normal) (this.uniforms.uTouchNormal.value as THREE.Vector3).copy(hit.normal).normalize()
          if (this.uniforms.uStrength.value < 0.015) (this.uniforms.uTouch.value as THREE.Vector3).copy(this.tmpV)
          this.prevTouchPos.copy(this.touchPos)
          this.touchPos.copy(this.tmpV)
          this.strokeVec
            .subVectors(this.touchPos, this.prevTouchPos)
            .multiplyScalar(1 / Math.max(dt, 0.001))
            .clampLength(0, 2)
          touching = true

          if (this.strokeVec.length() > 0.4 && time - lastPetSoundTime > 320) {
            lastPetSoundTime = time
            this.callbacks?.onPet?.()
          }
        }
      }

      this.renderer.domElement.style.cursor = this.hasContact ? 'grabbing' : touching ? 'grab' : 'default'

      this.uniforms.uFurScale.value = lerp(this.uniforms.uFurScale.value, this.config.furSize, alpha)
      this.uniforms.uFurThickness.value = lerp(this.uniforms.uFurThickness.value, this.config.furThickness, alpha)
      this.uniforms.uFurHighlight.value = lerp(this.uniforms.uFurHighlight.value, this.config.furHighlight, alpha)
      this.uniforms.uTouchRadius.value = lerp(this.uniforms.uTouchRadius.value, this.config.handSize, alpha)
      this.uniforms.uIconOpacity.value = lerp(this.uniforms.uIconOpacity.value, this.config.iconOpacity, alpha)

      const targetPress = touching ? (this.hasContact ? 1.35 : 0.85) * this.config.pressure : 0
      this.targetStrength += ((targetPress - this.uniforms.uStrength.value) * 105 - 18 * this.targetStrength) * dt
      this.uniforms.uStrength.value = Math.max(0, this.uniforms.uStrength.value + this.targetStrength * dt)
      ;(this.uniforms.uTouch.value as THREE.Vector3).lerp(this.touchPos, 1 - Math.exp(-28 * dt))
      if (!touching) this.strokeVec.set(0, 0, 0)
      ;(this.uniforms.uStroke.value as THREE.Vector3).lerp(this.strokeVec, 1 - Math.exp(-12 * dt))
      this.uniforms.uTime.value = this.timeAccum

      const trail = this.uniforms.uTrail.value as THREE.Vector4[]
      for (const t of trail) t.w *= Math.exp(-3.4 * dt)

      this.trailTime += dt
      if (touching && this.trailTime > 0.065) {
        for (let i = trail.length - 1; i > 0; i--) trail[i].copy(trail[i - 1])
        trail[0].set(this.touchPos.x, this.touchPos.y, this.touchPos.z, this.uniforms.uStrength.value)
        this.trailTime = 0
      }

      const shadowMat = this.shadowPlane.material as THREE.ShaderMaterial
      shadowMat.uniforms.uOpacity.value = 0.26 - 0.007 * Math.sin(0.95 * this.timeAccum) * (1 - rm)

      this.artworkMix = this.isReducedMotion ? 1 : Math.min(1, this.artworkMix + dt / 0.42)
      if (this.artworkMix === 1 && this.prevTex) {
        this.uniforms.uPreviousArtwork.value = this.currentTex
        this.prevTex.dispose()
        this.prevTex = null
      }

      const currActive = this.activeArtwork
      if (currActive !== this.uniforms.uArtwork.value?.userData?.sourceArt && this.artworkMix === 1 && currActive) {
        if (this.activeApngStop) {
          this.activeApngStop()
          this.activeApngStop = null
        }

        const wasEmpty = !this.uniforms.uArtwork.value?.userData?.sourceArt
        this.prevTex = this.currentTex
        this.uniforms.uPreviousArtwork.value = this.currentTex
        this.uniforms.uPreviousArtworkMode.value = this.uniforms.uArtworkMode.value
        ;(this.uniforms.uPreviousSideColor.value as THREE.Color).copy(this.uniforms.uSideColor.value as THREE.Color)

        let newTex: THREE.Texture
        if (currActive.canvas) {
          newTex = new THREE.CanvasTexture(currActive.canvas)
        } else {
          newTex = new THREE.DataTexture(new Uint8Array([152, 145, 255, 255]), 1, 1, THREE.RGBAFormat)
        }
        newTex.colorSpace = THREE.SRGBColorSpace
        newTex.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy())
        newTex.needsUpdate = true
        newTex.userData = { sourceArt: currActive }
        this.currentTex = newTex

        if (currActive.distanceMap) {
          this.currentDistanceMap = currActive.distanceMap
          this.uniforms.uDistanceMap.value = currActive.distanceMap
        }

        if (currActive.apngPlayer && currActive.ctx) {
          this.activeApngStop = currActive.apngPlayer.play((frameCanvas: HTMLCanvasElement) => {
            const ctx = currActive.ctx
            ctx.clearRect(0, 0, 512, 512)
            const padding = 0.88
            const scale = (512 * padding) / Math.max(frameCanvas.width, frameCanvas.height)
            const w = frameCanvas.width * scale
            const h = frameCanvas.height * scale
            const x = (512 - w) / 2
            const y = (512 - h) / 2
            ctx.drawImage(frameCanvas, x, y, w, h)
            newTex.needsUpdate = true
          })
        }

        this.uniforms.uArtwork.value = newTex
        this.uniforms.uArtworkMode.value = currActive.id === 'aave' ? 0 : 2
        ;(this.uniforms.uSideColor.value as THREE.Color).set(currActive.sideColor)
        this.artworkMix = wasEmpty || this.isReducedMotion ? 1 : 0
      }

      if (currActive?.apngPlayer && currActive?.ctx && !this.activeApngStop && this.currentTex) {
        this.activeApngStop = currActive.apngPlayer.play((frameCanvas: HTMLCanvasElement) => {
          const ctx = currActive.ctx
          ctx.clearRect(0, 0, 512, 512)
          const padding = 0.88
          const scale = (512 * padding) / Math.max(frameCanvas.width, frameCanvas.height)
          const w = frameCanvas.width * scale
          const h = frameCanvas.height * scale
          const x = (512 - w) / 2
          const y = (512 - h) / 2
          ctx.drawImage(frameCanvas, x, y, w, h)
          this.currentTex.needsUpdate = true
        })
      }

      this.uniforms.uArtworkMix.value = this.artworkMix * this.artworkMix * (3 - 2 * this.artworkMix)
      ;(shadowMat.uniforms.uColor.value as THREE.Color)
        .copy(this.uniforms.uPreviousSideColor.value as THREE.Color)
        .lerp(this.uniforms.uSideColor.value as THREE.Color, this.uniforms.uArtworkMix.value)
        .multiplyScalar(0.4)

      this.renderer.setRenderTarget(this.renderTarget)
      this.renderer.setClearColor(0xffffff, 0)
      this.renderer.render(this.scene, this.camera)
      this.renderer.setRenderTarget(null)
      this.renderer.setClearColor(0xffffff, 0)
      this.renderer.render(this.postScene, this.orthoCamera)

      this.animFrameId = requestAnimationFrame(renderLoop)
    }

    this.animFrameId = requestAnimationFrame(renderLoop)
  }

  public takeSnapshot(options?: { frontView?: boolean; size?: number }): string {
    const exportSize = options?.size ?? 1024
    const frontView = options?.frontView ?? true

    const prevPos = this.cushionGroup.position.clone()
    const prevQuat = this.cushionGroup.quaternion.clone()
    const prevShadowVis = this.shadowPlane.visible
    const prevAspect = this.camera.aspect
    const prevCamPos = this.camera.position.clone()

    this.shadowPlane.visible = false
    this.cushionGroup.position.set(0, 0, 0)
    if (frontView) {
      this.cushionGroup.quaternion.identity()
    }

    this.camera.aspect = 1
    this.camera.position.set(0, 0, 6.2)
    this.camera.updateProjectionMatrix()

    const exportTarget = new THREE.WebGLRenderTarget(exportSize, exportSize, {
      samples: 4,
    })
    const finalTarget = new THREE.WebGLRenderTarget(exportSize, exportSize)

    this.renderer.setRenderTarget(exportTarget)
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.clear()
    this.renderer.render(this.scene, this.camera)

    const prevPixel = (this.blurMat.uniforms.uPixel.value as THREE.Vector2).clone()
    const prevImage = this.blurMat.uniforms.uImage.value
    ;(this.blurMat.uniforms.uPixel.value as THREE.Vector2).set(1 / exportSize, 1 / exportSize)
    this.blurMat.uniforms.uImage.value = exportTarget.texture

    this.renderer.setRenderTarget(finalTarget)
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.clear()
    this.renderer.render(this.postScene, this.orthoCamera)

    const pixels = new Uint8Array(exportSize * exportSize * 4)
    this.renderer.readRenderTargetPixels(finalTarget, 0, 0, exportSize, exportSize, pixels)

    const canvas2d = document.createElement('canvas')
    canvas2d.width = exportSize
    canvas2d.height = exportSize
    const ctx2d = canvas2d.getContext('2d')
    let minX = exportSize
    let maxX = 0
    let minY = exportSize
    let maxY = 0
    let hasPixels = false

    if (ctx2d) {
      const imgData = ctx2d.createImageData(exportSize, exportSize)
      for (let y = 0; y < exportSize; y++) {
        const srcRow = (exportSize - 1 - y) * exportSize * 4
        const dstRow = y * exportSize * 4
        imgData.data.set(pixels.subarray(srcRow, srcRow + exportSize * 4), dstRow)
      }
      ctx2d.putImageData(imgData, 0, 0)

      const data = imgData.data
      for (let y = 0; y < exportSize; y++) {
        for (let x = 0; x < exportSize; x++) {
          const a = data[(y * exportSize + x) * 4 + 3]
          if (a > 12) {
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
            hasPixels = true
          }
        }
      }
    }

    let dataUrl = canvas2d.toDataURL('image/png')

    if (hasPixels && maxX > minX && maxY > minY) {
      const bbW = maxX - minX + 1
      const bbH = maxY - minY + 1
      const maxDim = Math.max(bbW, bbH)

      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = exportSize
      finalCanvas.height = exportSize
      const finalCtx = finalCanvas.getContext('2d')
      if (finalCtx) {
        finalCtx.imageSmoothingEnabled = true
        finalCtx.imageSmoothingQuality = 'high'
        const targetSpan = exportSize * 0.985
        const scale = targetSpan / maxDim
        const destW = Math.round(bbW * scale)
        const destH = Math.round(bbH * scale)
        const destX = Math.round((exportSize - destW) / 2)
        const destY = Math.round((exportSize - destH) / 2)
        finalCtx.drawImage(canvas2d, minX, minY, bbW, bbH, destX, destY, destW, destH)
        dataUrl = finalCanvas.toDataURL('image/png')
      }
    }

    exportTarget.dispose()
    finalTarget.dispose()
    ;(this.blurMat.uniforms.uPixel.value as THREE.Vector2).copy(prevPixel)
    this.blurMat.uniforms.uImage.value = prevImage

    this.shadowPlane.visible = prevShadowVis
    this.cushionGroup.position.copy(prevPos)
    this.cushionGroup.quaternion.copy(prevQuat)
    this.camera.aspect = prevAspect
    this.camera.position.copy(prevCamPos)
    this.camera.updateProjectionMatrix()
    this.renderer.setRenderTarget(null)

    return dataUrl
  }

  public resetOrientation() {
    this.targetRot.set(0.08, -0.08, 0, 'YXZ')
    this.targetQuat.setFromEuler(this.targetRot)
  }

  public zoomIn(step = 1.15) {
    this.targetZoomLevel = clamp(this.targetZoomLevel * step, 0.4, 3.0)
  }

  public zoomOut(step = 1.15) {
    this.targetZoomLevel = clamp(this.targetZoomLevel / step, 0.4, 3.0)
  }

  public resetZoom() {
    this.targetZoomLevel = 1.0
  }

  public resetTouch() {
    this.targetStrength = 0
    this.hasContact = false
    this.touchPos.set(0, 0, 4)
    if (this.uniforms?.uStrength) {
      this.uniforms.uStrength.value = 0
    }
    if (this.uniforms?.uTouch) {
      ;(this.uniforms.uTouch.value as THREE.Vector3).set(0, 0, 4)
    }
    if (this.uniforms?.uTrail) {
      for (const t of this.uniforms.uTrail.value as THREE.Vector4[]) {
        t.set(0, 0, 4, 0)
      }
    }
  }

  public updateConfig(newConfig: PlushConfig) {
    const prev = this.config
    this.config = { ...newConfig }

    if (this.uniforms) {
      if (this.uniforms.uFurScale) this.uniforms.uFurScale.value = this.config.furSize
      if (this.uniforms.uFurThickness) this.uniforms.uFurThickness.value = this.config.furThickness
      if (this.uniforms.uFurHighlight) this.uniforms.uFurHighlight.value = this.config.furHighlight
      if (this.uniforms.uTouchRadius) this.uniforms.uTouchRadius.value = this.config.handSize
      if (this.uniforms.uIconOpacity) this.uniforms.uIconOpacity.value = this.config.iconOpacity
      if (this.uniforms.uSideColor) {
        ;(this.uniforms.uSideColor.value as THREE.Color).set(this.config.sideColor)
      }
    }

    const roundnessChanged = Math.abs(prev.roundness - newConfig.roundness) > 0.001
    const cornerRadiusChanged = Math.abs(prev.cornerRadius - newConfig.cornerRadius) > 0.001
    const puffinessChanged = Math.abs(prev.puffiness - newConfig.puffiness) > 0.001

    if (roundnessChanged || cornerRadiusChanged || puffinessChanged) {
      const newGeoms = this.getGeoms(this.config.roundness, this.config.cornerRadius, this.config.puffiness)
      if (this.baseMesh && newGeoms.baseGeom) {
        this.baseMesh.geometry = newGeoms.baseGeom
      }
      if (this.furMesh && newGeoms.furGeom) {
        this.furMesh.geometry = newGeoms.furGeom
      }
    }
  }

  public dispose() {
    this.stopRendering = true
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
    }
    if (this.activeApngStop) {
      this.activeApngStop()
    }
    for (const d of this.cleanupDisposables) {
      d()
    }
    this.renderer.dispose()
    this.renderTarget.dispose()
    for (const key of Object.keys(this.geomCache)) {
      this.geomCache[key].baseGeom.dispose()
      this.geomCache[key].furGeom.dispose()
    }
  }
}
