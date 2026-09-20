'use client'

import * as React from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { cn } from '@/registry/lib/utils'
import { getOptimizedImageUrl } from '@/registry/lib/next-image-url'

export interface PreviewItem {
  id: string | number
  title: string
  subtitle?: string
  mediaUrl: string
  num?: string
}

export interface VelocityHoverPreviewProps {
  items: PreviewItem[]
  accentColor?: string
  gridDensity?: number
  warpIntensity?: number
  className?: string
  itemClassName?: string
  onItemSelect?: (item: PreviewItem) => void
}

const vertexShaderSource = `
uniform vec2  uVelocity;
uniform float uWarpStrength;
uniform float uWarpEnabled;
varying vec2  vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  if (uWarpEnabled > 0.5) {
    float velLen = length(uVelocity);
    if (velLen > 0.001) {
      vec2 velDir = uVelocity / velLen;
      float along = dot((uv - 0.5) * 2.0, velDir);
      float trailW = 1.0 - (along * 0.5 + 0.5);
      trailW = trailW * trailW;
      pos.xy += uVelocity * trailW * uWarpStrength;
    }
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const fragmentShaderSource = `
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float     uProgress;
uniform float     uGridSize;
uniform vec3      uPixelColor;
uniform float     uAlpha;
uniform float     uTransitioning;
uniform float     uDirection;
uniform float     uWaveNoise;
uniform float     uBandWidth;
uniform float     uEntry;
uniform float     uExit;
varying vec2      vUv;

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  if (uAlpha <= 0.001) discard;

  if (uTransitioning < 0.5) {
    gl_FragColor = vec4(texture2D(uTexA, vUv).rgb, uAlpha);
  } else {
    vec2 waveCell = floor(vUv * uGridSize);
    float cellY = waveCell.y / uGridSize;
    float dirY = uDirection > 0.0 ? cellY : (1.0 - cellY);

    float cellNoise = (rand(waveCell) - 0.5) * 2.0;
    float crossNoise = (rand(waveCell + vec2(17.3, 5.7)) - 0.5) * 2.0;
    float noise = (cellNoise + crossNoise * 0.4) * uWaveNoise;

    float threshold = dirY + noise;
    float band = uBandWidth / uGridSize;

    if (threshold > uProgress + band) {
      if (uEntry > 0.5) discard;
      gl_FragColor = vec4(texture2D(uTexA, vUv).rgb, uAlpha);
    } else if (threshold > uProgress - band) {
      float bv = rand(waveCell) * 0.22 + 0.78;
      gl_FragColor = vec4(uPixelColor * bv, uAlpha);
    } else {
      if (uExit > 0.5) discard;
      gl_FragColor = vec4(texture2D(uTexB, vUv).rgb, uAlpha);
    }
  }
}
`

export function VelocityHoverPreview({
  items,
  accentColor = '#ffe9a8',
  gridDensity = 32,
  warpIntensity = 0.45,
  className,
  itemClassName,
  onItemSelect,
}: VelocityHoverPreviewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])

  const [activeIdx, setActiveIdx] = React.useState<number | null>(null)

  const stateRef = React.useRef({
    renderer: null as THREE.WebGLRenderer | null,
    camera: null as THREE.OrthographicCamera | null,
    scene: null as THREE.Scene | null,
    mesh: null as THREE.Mesh | null,
    textures: [] as THREE.Texture[],
    displayedIdx: -1,
    currentIdx: -1,
    entryDir: 1,
    exiting: false,
    visible: true,
    raf: 0,
    uniforms: null as any,
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
    velX: 0,
    velY: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    rotZ: 0,
    smoothVelX: 0,
    smoothVelY: 0,
  })

  // Setup WebGL Scene
  React.useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas || items.length === 0) return

    const s = stateRef.current
    const loader = new THREE.TextureLoader()

    s.textures = items.map((it) => {
      const tex = loader.load(getOptimizedImageUrl(it.mediaUrl, { width: 1200 }))
      tex.generateMipmaps = false
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      return tex
    })

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5))
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    s.renderer = renderer

    const camera = new THREE.OrthographicCamera(
      -container.offsetWidth / 2,
      container.offsetWidth / 2,
      container.offsetHeight / 2,
      -container.offsetHeight / 2,
      0.1,
      10,
    )
    camera.position.z = 1
    s.camera = camera

    const scene = new THREE.Scene()
    s.scene = scene

    const cardWidth = Math.min(container.offsetWidth * 0.38, 380)
    const cardHeight = cardWidth * 0.62
    const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 28, 28)

    const colorHex = new THREE.Color(accentColor)

    const uniforms = {
      uTexA: { value: s.textures[0] || null },
      uTexB: { value: s.textures[0] || null },
      uProgress: { value: 0 },
      uGridSize: { value: gridDensity },
      uPixelColor: { value: colorHex },
      uAlpha: { value: 0 },
      uTransitioning: { value: 0 },
      uDirection: { value: 1 },
      uWaveNoise: { value: 0.14 },
      uBandWidth: { value: 4 },
      uEntry: { value: 0 },
      uExit: { value: 0 },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uWarpStrength: { value: warpIntensity },
      uWarpEnabled: { value: 1.0 },
    }
    s.uniforms = uniforms

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      transparent: true,
      depthTest: false,
      uniforms,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    s.mesh = mesh

    const handleResize = () => {
      if (!container || !s.camera || !s.renderer) return
      const w = container.offsetWidth
      const h = container.offsetHeight
      s.camera.left = -w / 2
      s.camera.right = w / 2
      s.camera.top = h / 2
      s.camera.bottom = -h / 2
      s.camera.updateProjectionMatrix()
      s.renderer.setSize(w, h)
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    const io = new IntersectionObserver(
      ([entry]) => {
        s.visible = entry.isIntersecting
      },
      { threshold: 0.05 },
    )
    io.observe(container)

    // Snappy, non-blocking render loop with dormancy when idle
    const renderLoop = () => {
      s.raf = requestAnimationFrame(renderLoop)

      // Sleep GPU when tab is hidden or when no item is hovered / transitioning
      if (!s.visible || document.hidden || (s.displayedIdx === -1 && !s.exiting)) {
        return
      }

      const followSpeed = 0.18
      const rotDamping = 0.08
      const warpDamping = 0.07

      s.posX += (s.mouseX - s.posX) * followSpeed
      s.posY += (s.mouseY - s.posY) * followSpeed

      s.velX = s.mouseX - (s.lastMouseX !== undefined ? s.lastMouseX : s.mouseX)
      s.velY = s.mouseY - (s.lastMouseY !== undefined ? s.lastMouseY : s.mouseY)
      s.lastMouseX = s.mouseX
      s.lastMouseY = s.mouseY

      s.rotZ += (-s.velX * 0.0035 - s.rotZ) * rotDamping
      s.smoothVelX += (s.velX - s.smoothVelX) * warpDamping
      s.smoothVelY += (s.velY - s.smoothVelY) * warpDamping

      uniforms.uVelocity.value.set(s.smoothVelX, -s.smoothVelY)

      if (mesh) {
        mesh.position.x = s.posX
        mesh.position.y = s.posY
        mesh.rotation.z = s.rotZ
      }

      if (s.renderer && s.scene && s.camera) {
        s.renderer.render(s.scene, s.camera)
      }
    }
    renderLoop()

    return () => {
      cancelAnimationFrame(s.raf)
      ro.disconnect()
      io.disconnect()
      geometry.dispose()
      material.dispose()
      s.textures.forEach((t) => t.dispose())
      if (renderer) {
        renderer.dispose()
        renderer.forceContextLoss()
      }
    }
  }, [items, accentColor, gridDensity, warpIntensity])

  const transitionTo = (idx: number) => {
    const s = stateRef.current
    if (s.displayedIdx === idx || !s.uniforms) return
    const dir = idx > s.displayedIdx ? -1 : 1
    s.displayedIdx = idx

    const u = s.uniforms
    u.uTexB.value = s.textures[idx]
    u.uDirection.value = dir
    u.uEntry.value = 0
    u.uExit.value = 0
    u.uTransitioning.value = 1
    u.uProgress.value = 0

    gsap.killTweensOf(u.uProgress)
    gsap.to(u.uProgress, {
      value: 1.25,
      duration: 0.52,
      ease: 'power2.out',
      onComplete: () => {
        u.uTransitioning.value = 0
        u.uProgress.value = 0
        u.uTexA.value = s.textures[idx]
      },
    })
  }

  const enterTransition = (idx: number) => {
    const s = stateRef.current
    if (!s.uniforms) return

    s.displayedIdx = idx
    s.exiting = false

    const u = s.uniforms
    u.uTexA.value = s.textures[idx]
    u.uTexB.value = s.textures[idx]
    u.uAlpha.value = 1
    u.uDirection.value = -1
    u.uEntry.value = 1
    u.uExit.value = 0
    u.uTransitioning.value = 1
    u.uProgress.value = 0

    gsap.killTweensOf(u.uProgress)
    gsap.to(u.uProgress, {
      value: 1.25,
      duration: 0.52,
      ease: 'power2.out',
      onComplete: () => {
        u.uTransitioning.value = 0
        u.uEntry.value = 0
        u.uProgress.value = 0
        u.uTexA.value = s.textures[idx]
      },
    })
  }

  const exitTransition = () => {
    const s = stateRef.current
    if (s.displayedIdx === -1 || !s.uniforms) return
    const u = s.uniforms
    u.uDirection.value = 1
    u.uEntry.value = 0
    u.uExit.value = 1
    u.uTransitioning.value = 1
    u.uProgress.value = 0
    s.exiting = true

    gsap.killTweensOf(u.uProgress)
    gsap.to(u.uProgress, {
      value: 1.25,
      duration: 0.45,
      ease: 'power2.out',
      onComplete: () => {
        u.uTransitioning.value = 0
        u.uExit.value = 0
        u.uAlpha.value = 0
        u.uProgress.value = 0
        s.displayedIdx = -1
        s.currentIdx = -1
        s.exiting = false
      },
    })
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const s = stateRef.current
    s.mouseX = e.clientX - rect.left - rect.width / 2
    s.mouseY = -(e.clientY - rect.top - rect.height / 2)
  }

  const handleItemEnter = (index: number) => {
    const s = stateRef.current
    setActiveIdx(index)

    if (s.currentIdx === index && !s.exiting) return
    s.currentIdx = index

    if (s.displayedIdx === -1 || s.exiting) {
      enterTransition(index)
    } else {
      transitionTo(index)
    }
  }

  const handleMouseLeave = () => {
    setActiveIdx(null)
    exitTransition()
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handleMouseLeave}
      className={cn('relative w-full select-none py-12', className)}
    >
      {/* Floating Canvas: Pure WebGL mesh with no fake borders or shadows */}
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" />

      {/* Interactive List */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col divide-y divide-border/40">
        {items.map((item, idx) => {
          const isSelected = activeIdx === idx
          const numFormatted = item.num || (idx < 9 ? `0${idx + 1}` : `${idx + 1}`)

          return (
            <div
              key={item.id}
              ref={(el) => {
                itemRefs.current[idx] = el
              }}
              onPointerEnter={() => handleItemEnter(idx)}
              onClick={() => onItemSelect?.(item)}
              className={cn(
                'group flex cursor-pointer items-center justify-between gap-6 py-6 transition-all duration-300 ease-out',
                isSelected ? 'translate-x-2 text-foreground' : 'text-muted-foreground hover:text-foreground',
                itemClassName,
              )}
            >
              <div className="flex flex-col gap-1">
                <span className="text-xl font-semibold tracking-tight text-foreground transition-colors sm:text-2xl lg:text-3xl">
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="text-xs font-normal text-muted-foreground transition-colors group-hover:text-foreground/80 sm:text-sm">
                    {item.subtitle}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium opacity-40 shrink-0">{numFormatted}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
