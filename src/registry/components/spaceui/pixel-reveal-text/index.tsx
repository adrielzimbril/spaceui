'use client'

import * as React from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/registry/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export interface PixelRevealTextProps {
  text: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string | number
  color?: string
  edgeColor?: string
  pixelSize?: number
  noiseStrength?: number
  edgeWidth?: number
  progress?: number
  speed?: number
  loop?: boolean
  trigger?: 'loop' | 'scroll' | 'hover'
  as?: React.ElementType
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
uniform sampler2D uGlyphTexture;
uniform float uProgress;
uniform float uBlockSize;
uniform float uJitterNoise;
uniform vec2  uCanvasSize;
uniform vec3  uTextColor;
uniform vec3  uGlowEdgeColor;
uniform float uGlowWidth;
varying vec2  vUv;

float hash2D(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}

void main() {
  if (uProgress <= 0.001) discard;

  vec4 baseSample = texture2D(uGlyphTexture, vUv);
  if (baseSample.a < 0.02) discard;

  vec2 blockCoord = floor(vUv * uCanvasSize / max(uBlockSize, 1.0));
  vec2 blockUv = clamp((blockCoord * uBlockSize + uBlockSize * 0.5) / uCanvasSize, vec2(0.0), vec2(1.0));

  float randomNoise = hash2D(blockCoord);
  float verticalGradient = 1.0 - blockUv.y;
  float activationThreshold = mix(verticalGradient, randomNoise, uJitterNoise);

  float visibility = smoothstep(activationThreshold - 0.08, activationThreshold, uProgress);
  if (visibility < 0.01) discard;

  float edgeDistance = abs(uProgress - activationThreshold);
  float edgeGlow = smoothstep(uGlowWidth, 0.0, edgeDistance) * (1.0 - smoothstep(0.85, 1.0, uProgress));

  vec3 finalRgb = mix(baseSample.rgb, uGlowEdgeColor, clamp(edgeGlow * 1.5, 0.0, 1.0));
  gl_FragColor = vec4(finalRgb, baseSample.a * visibility);
}
`

export function PixelRevealText({
  text,
  fontSize = 44,
  fontFamily = 'inherit',
  fontWeight = 600,
  color,
  edgeColor = '#ffe9a8',
  pixelSize = 4,
  noiseStrength = 0.35,
  edgeWidth = 0.12,
  progress: controlledProgress,
  speed = 1,
  loop = true,
  trigger = 'loop',
  className,
}: PixelRevealTextProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const progressTargetRef = React.useRef(0.0)
  const [themeVersion, setThemeVersion] = React.useState(0)

  // Listen to global and local theme switches
  React.useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return
    const observer = new MutationObserver(() => {
      setThemeVersion((v) => v + 1)
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme'],
    })
    let p: HTMLElement | null = containerRef.current.parentElement
    while (p && p !== document.body) {
      observer.observe(p, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      })
      p = p.parentElement
    }
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const computedStyle = getComputedStyle(container)
    const effectiveFontFamily = fontFamily !== 'inherit' ? fontFamily : computedStyle.fontFamily
    let effectiveColor = color
    if (!effectiveColor) {
      const cssColor = computedStyle.color
      if (cssColor && cssColor !== 'transparent' && cssColor !== 'rgba(0, 0, 0, 0)') {
        effectiveColor = cssColor
      }
    }
    if (!effectiveColor) {
      // Walk up parents to see if placed inside dark preview / container or if html is dark
      let isDark = false
      let cur: HTMLElement | null = container
      while (cur && cur !== document.documentElement) {
        if (cur.classList.contains('dark') || cur.classList.contains('force-dark')) {
          isDark = true
          break
        }
        if (cur.classList.contains('light') || cur.classList.contains('force-light')) {
          isDark = false
          break
        }
        const bg = window.getComputedStyle(cur).backgroundColor
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          const match = bg.match(/\d+/g)
          if (match && match.length >= 3) {
            const r = parseInt(match[0], 10)
            const g = parseInt(match[1], 10)
            const b = parseInt(match[2], 10)
            isDark = (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5
            break
          }
        }
        cur = cur.parentElement
      }
      if (!isDark && typeof document !== 'undefined') {
        isDark = document.documentElement.classList.contains('dark')
      }
      effectiveColor = isDark ? '#ffffff' : '#09090b'
    }

    // 1. Off-screen canvas to rasterize sharp crisp text
    const textCanvas = document.createElement('canvas')
    const textCtx = textCanvas.getContext('2d')
    if (!textCtx) return

    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)
    const scaledFontSize = fontSize * dpr

    textCtx.font = `${fontWeight} ${scaledFontSize}px ${effectiveFontFamily}`
    const metrics = textCtx.measureText(text)
    const textWidth = Math.ceil(metrics.width) + 32 * dpr
    const fontAscent = metrics.actualBoundingBoxAscent || scaledFontSize * 0.8
    const fontDescent = metrics.actualBoundingBoxDescent || scaledFontSize * 0.2
    const textHeight = Math.ceil(fontAscent + fontDescent) + 24 * dpr

    textCanvas.width = textWidth
    textCanvas.height = textHeight

    textCtx.font = `${fontWeight} ${scaledFontSize}px ${effectiveFontFamily}`
    textCtx.fillStyle = effectiveColor
    textCtx.textBaseline = 'top'
    textCtx.fillText(text, 16 * dpr, 12 * dpr)

    const textTexture = new THREE.CanvasTexture(textCanvas)
    textTexture.minFilter = THREE.LinearFilter
    textTexture.magFilter = THREE.LinearFilter

    // 2. Setup Three.js WebGL Scene
    const displayWidth = textWidth / dpr
    const displayHeight = textHeight / dpr

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setPixelRatio(dpr)
    renderer.setSize(displayWidth, displayHeight)

    const camera = new THREE.OrthographicCamera(
      -displayWidth / 2,
      displayWidth / 2,
      displayHeight / 2,
      -displayHeight / 2,
      0.1,
      10,
    )
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(displayWidth, displayHeight)

    const textColorVec = new THREE.Color(effectiveColor)
    const edgeColorVec = new THREE.Color(edgeColor)

    const uniforms = {
      uGlyphTexture: { value: textTexture },
      uProgress: { value: controlledProgress !== undefined ? controlledProgress : 0.0 },
      uBlockSize: { value: pixelSize * dpr },
      uJitterNoise: { value: noiseStrength },
      uCanvasSize: { value: new THREE.Vector2(textWidth, textHeight) },
      uTextColor: { value: textColorVec },
      uGlowEdgeColor: { value: edgeColorVec },
      uGlowWidth: { value: edgeWidth },
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

    let animationFrameId = 0
    let gsapTimeline: gsap.core.Timeline | null = null
    let hoverTween: gsap.core.Tween | null = null
    let scrollTriggerInstance: ScrollTrigger | null = null

    const effectiveMode = controlledProgress !== undefined ? 'controlled' : trigger || (loop ? 'loop' : 'scroll')

    const s = Math.max(0.1, (Number(speed) || 1) * 0.75)

    if (effectiveMode === 'controlled') {
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        const current = uniforms.uProgress.value
        const delta = controlledProgress - current
        if (Math.abs(delta) > 0.001) {
          uniforms.uProgress.value += delta * 0.1
          renderer.render(scene, camera)
        }
      }
      animate()
      renderer.render(scene, camera)
    } else if (effectiveMode === 'hover') {
      // Hover mode: text is displayed; on hover, triggers the pixel reveal animation
      uniforms.uProgress.value = 1.15
      renderer.render(scene, camera)

      const progressObj = { p: 1.15 }
      const handlePointerEnter = () => {
        hoverTween?.kill()
        progressObj.p = 0.0
        uniforms.uProgress.value = 0.0
        renderer.render(scene, camera)
        hoverTween = gsap.to(progressObj, {
          p: 1.15,
          duration: 0.95 / s,
          ease: 'power2.out',
          onUpdate: () => {
            uniforms.uProgress.value = progressObj.p
            renderer.render(scene, camera)
          },
        })
      }

      container.addEventListener('pointerenter', handlePointerEnter)

      return () => {
        container.removeEventListener('pointerenter', handlePointerEnter)
        hoverTween?.kill()
        geometry.dispose()
        material.dispose()
        textTexture.dispose()
        renderer.dispose()
      }
    } else if (effectiveMode === 'loop') {
      // Loop mode: reveal -> hold -> smooth reset -> repeat
      const state = { p: 0.0 }
      gsapTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.5 / s })
      gsapTimeline
        .to(state, {
          p: 1.15,
          duration: 1.8 / s,
          ease: 'power2.out',
          onUpdate: () => {
            uniforms.uProgress.value = state.p
            renderer.render(scene, camera)
          },
        })
        .to(state, {
          p: 1.15,
          duration: 1.5 / s, // Hold revealed state
        })
        .to(state, {
          p: 0.0,
          duration: 0.9 / s,
          ease: 'power2.inOut',
          onUpdate: () => {
            uniforms.uProgress.value = state.p
            renderer.render(scene, camera)
          },
        })
    } else {
      // ScrollTrigger mode
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        const current = uniforms.uProgress.value
        const delta = progressTargetRef.current - current
        if (Math.abs(delta) > 0.001) {
          uniforms.uProgress.value += delta * 0.08 * s
          renderer.render(scene, camera)
        }
      }
      animate()

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: container,
        start: 'top 90%',
        end: 'bottom 60%',
        scrub: 0.6 / s,
        onUpdate: (self) => {
          progressTargetRef.current = self.progress
        },
      })
    }

    return () => {
      cancelAnimationFrame(animationFrameId)
      gsapTimeline?.kill()
      hoverTween?.kill()
      scrollTriggerInstance?.kill()
      geometry.dispose()
      material.dispose()
      textTexture.dispose()
      renderer.dispose()
    }
  }, [
    text,
    fontSize,
    fontFamily,
    fontWeight,
    color,
    edgeColor,
    pixelSize,
    noiseStrength,
    edgeWidth,
    controlledProgress,
    speed,
    loop,
    trigger,
    themeVersion,
  ])

  return (
    <div
      ref={containerRef}
      className={cn('inline-block max-w-full overflow-hidden align-middle leading-none text-foreground', className)}
      aria-label={text}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}
