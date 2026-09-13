'use client'

import gsap from 'gsap'
import { useEffect, useRef, type RefObject } from 'react'
import {
  ClampToEdgeWrapping,
  Color,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'

const lensImageData = [
  { colors: ['#F0E6EB', '#B05A49', '#E9C88F', '#30334A'], size: [2560, 1791] },
  { colors: ['#8FAAD7', '#B0CDF2', '#D4ECFC', '#7089B6'], size: [2560, 1707] },
  { colors: ['#D0AE93', '#FAEDCE', '#D5CDCA', '#8C7874'], size: [2560, 1708] },
  { colors: ['#EDF5F8', '#C8D5DA', '#2A2728', '#B6AAB0'], size: [2560, 1707] },
  { colors: ['#EDEDEE', '#332D2D', '#CDB7AC', '#534B4B'], size: [2560, 1707] },
  { colors: ['#FAF7EE', '#EBCA94', '#D5D0CF', '#CFAA78'], size: [2560, 1708] },
  { colors: ['#524F4A', '#75706A', '#979287', '#B6B3A8'], size: [2560, 1708] },
  { colors: ['#4D4C48', '#757167', '#959288', '#B7B3A7'], size: [2560, 1708] },
  { colors: ['#4D4B46', '#D8D3C8', '#777066', '#B9B2A7'], size: [2560, 1707] },
  { colors: ['#8999A7', '#F3EACF', '#4F4C34', '#D0C9B2'], size: [2048, 2560] },
  { colors: ['#F3FBFE', '#B7C6D3', '#59564D', '#ECD8B5'], size: [2560, 1708] },
  { colors: ['#D3E5F0', '#AFC8DC', '#7193B0', '#B4CFE6'], size: [2560, 1708] },
  { colors: ['#EDEDEE', '#CFD0D2', '#B0B2B1', '#B78D16'], size: [2560, 1707] },
  { colors: ['#D0C8B6', '#B7AA94', '#988569', '#E8E5D8'], size: [2560, 1708] },
  { colors: ['#E8EBEB', '#B5B6AC', '#4E4C4A', '#727268'], size: [2560, 1708] },
  { colors: ['#D4D4CD', '#B5B5AC', '#322F2D', '#91928F'], size: [2560, 1708] },
  { colors: ['#4E453A', '#D0D0CF', '#726854', '#B4B1AD'], size: [2560, 1707] },
  { colors: ['#F4F4F4', '#D6D1CC', '#CDD28E', '#AAB370'], size: [2560, 1708] },
  { colors: ['#F5F5F2', '#AD9271', '#6C4E34', '#D4CBB3'], size: [2560, 1707] },
  { colors: ['#FCFAEF', '#E9D7AF', '#301308', '#D2B88B'], size: [2560, 1707] },
  { colors: ['#B2906C', '#916E4F', '#704B34', '#D1B48D'], size: [2560, 1707] },
  { colors: ['#F6F4F2', '#DACFC9', '#8E786B', '#AE988C'], size: [2560, 1440] },
  { colors: ['#FAF9F6', '#736B67', '#554F4D', '#AC968B'], size: [2560, 1708] },
  { colors: ['#020508', '#192835', '#4C6579', '#324657'], size: [2560, 1707] },
  { colors: ['#EAEBF0', '#2E2E36', '#99AAB6', '#75868F'], size: [2560, 1706] },
  { colors: ['#E9E9D4', '#CFCEB2', '#282A2C', '#B1AF91'], size: [2560, 1708] },
  { colors: ['#F5F3EF', '#DAD6CB', '#D1B58F', '#B4956F'], size: [2560, 1707] },
  { colors: ['#565147', '#FCFAF4', '#8F8876', '#AFA998'], size: [2560, 1707] },
  { colors: ['#FAF8F3', '#545049', '#D5C8B3', '#B7A791'], size: [2560, 1707] },
  { colors: ['#B4B4B1', '#95918C', '#EDE6D5', '#4F362A'], size: [2560, 1707] },
] as const

export const galleryImageSizes = lensImageData.map(({ size }) => size)

const vertexShader = /* glsl */ `
precision highp float;

#ifndef DETAILS_QUALITY
  #define DETAILS_QUALITY 2
#endif

varying vec2 vUv;
varying float vTopFade;

uniform vec2 iResolution;
uniform vec2 uSize;
uniform float uEffectsStrength;
uniform float uEffectsHorizontalProgress;
uniform float uEffectsHorizontalStrength;
uniform float uEffectsHorizontalWaveSmooth;
uniform float uEffectsHorizontalWaveSpacing;
uniform float uRollTopBend;
uniform float uRollTopFade;
uniform float uRollTopFadeStart;
uniform float uRollTopRadius;
uniform float uRollTopRange;
uniform float uRollTopReturn;
uniform float uRollTopStart;
uniform float uRollTopWaveAmp;
uniform float uRollTopWaveFreq;
uniform float uRollTopWaveSmooth;
uniform float uRollTopWaveSpacing;
uniform float uEffectsWaveSmooth;
uniform float uEffectsWaveSpacing;
uniform float uScrollPos;
uniform float uVelocity;

void main() {
  vUv = uv;

  vec3 nPos = position.xyz;

  float rollPower = max(
    max(abs(uRollTopBend), abs(uRollTopFade)),
    max(abs(uRollTopRadius), abs(uRollTopWaveAmp))
  );

  vTopFade = 0.0;

  if ( rollPower > 0.00001 ) {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    float topThreshold = (iResolution.y * 0.5) - (iResolution.y * uRollTopStart);
    float topRange = max(iResolution.y * uRollTopRange, 1.0);
    float band = clamp((worldPosition.y - topThreshold) / topRange, 0.0, 1.0);
    float rollMask = smoothstep(0.0, 1.0, band);
    float rollEnter = smoothstep(0.0, 0.42, band);
    float rollReturn = smoothstep(0.44, 0.92, band);
    float curlEnter = sin(rollEnter * PI * 0.5);
    float curlReturn = sin(rollReturn * PI);
    float sCurve = (curlEnter * 0.92) - (curlReturn * uRollTopReturn * 0.48);
    float lift = smoothstep(0.62, 0.98, band) * uRollTopBend * 0.18;
    float waveMask = sin(band * PI);
    float wavePhase = (
      (nPos.x / max(uSize.x * 0.5, 1.0)) * PI * uRollTopWaveFreq / max(uRollTopWaveSpacing, 0.001)
      - uScrollPos * 0.01
    );
    float primaryWave = sin(wavePhase);
#if DETAILS_QUALITY <= 0
    float smoothWave = primaryWave;
#else
    float secondaryWave = sin(wavePhase * 0.52 - 0.95);
    float tertiaryWave = sin(wavePhase * 0.31 + 1.2);
    float smoothWave = (primaryWave * 0.68) + (secondaryWave * 0.22) + (tertiaryWave * 0.10);
#endif
    float surfaceWave = mix(primaryWave, smoothWave, clamp(uRollTopWaveSmooth, 0.0, 1.0)) * uRollTopWaveAmp * waveMask;

    nPos.y += lift;
    nPos.z -= sCurve * uRollTopRadius * rollMask;
    nPos.z += surfaceWave;

    vTopFade = pow(smoothstep(uRollTopFadeStart, 1.0, band), 0.7) * uRollTopFade;
  }

  vec4 mvPosition = modelViewMatrix * vec4(nPos, 1.0);
  float horizontalProgress = clamp(uEffectsHorizontalProgress, 0.0, 1.0);

  if ( horizontalProgress < 0.999 && abs(uVelocity) > 0.00001 && abs(uEffectsStrength) > 0.00001 ) {
    float flutterPhase = (
      (mvPosition.y / max(iResolution.y, 1.0)) * PI * 2.0 / max(uEffectsWaveSpacing, 0.001)
      - uScrollPos / max(iResolution.y, 1.0)
    );
    float baseWave = sin(flutterPhase);
#if DETAILS_QUALITY <= 0
    float smoothFlutter = baseWave;
#else
    float detailWave = sin(flutterPhase * 0.48 - 1.1);
    float flutterWaveTertiary = sin(flutterPhase * 0.26 + 1.6);
    float smoothFlutter = (baseWave * 0.72) + (detailWave * 0.20) + (flutterWaveTertiary * 0.08);
#endif
    float flutter = mix(baseWave, smoothFlutter, clamp(uEffectsWaveSmooth, 0.0, 1.0));

    mvPosition.z += flutter * uVelocity * uEffectsStrength * 12.0 * (1.0 - horizontalProgress);
  }

  if ( horizontalProgress > 0.001 && abs(uVelocity) > 0.00001 && abs(uEffectsHorizontalStrength) > 0.00001 ) {
    float horizontalPhase = (
      (mvPosition.x / max(iResolution.x, 1.0)) * PI * 2.0 / max(uEffectsHorizontalWaveSpacing, 0.001)
      - uScrollPos / max(iResolution.x, 1.0)
    );
    float horizontalWave = sin(horizontalPhase);
#if DETAILS_QUALITY <= 0
    float smoothHorizontalWave = horizontalWave;
#else
    float horizontalDetailWave = sin(horizontalPhase * 0.42 - 0.8);
    float horizontalTertiaryWave = sin(horizontalPhase * 0.24 + 1.35);
    float smoothHorizontalWave = (horizontalWave * 0.68) + (horizontalDetailWave * 0.22) + (horizontalTertiaryWave * 0.10);
#endif
    float horizontalFlutter = mix(horizontalWave, smoothHorizontalWave, clamp(uEffectsHorizontalWaveSmooth, 0.0, 1.0));

    mvPosition.z += horizontalFlutter * uVelocity * uEffectsHorizontalStrength * 12.0 * horizontalProgress;
  }

  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = /* glsl */ `
precision highp float;

#ifndef DETAILS_QUALITY
  #define DETAILS_QUALITY 2
#endif

varying vec2 vUv;
varying float vTopFade;
uniform sampler2D tDiffuse;
uniform vec2 uUvScale;

uniform float uAlpha;
uniform float uEffectsAberration;
uniform float uEffectsBlurFade;
uniform float uEffectsBlurHorizontal;
uniform float uEffectsBlurVelocity;
uniform float uEffectsHorizontalProgress;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;

uniform float uImageMix;
uniform float uVelocity;

void main() {
  if ( uAlpha <= 0.00001 ) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 uvCover = vUv * uUvScale + (1.0 - uUvScale) * 0.5;
  vec2 uvGradient = uvCover;
  vec2 res = vec2(1.0, 1.0);

  float dist = distance(vec2(res.x * 0.5, res.y * 0.5), uvGradient.xy) * 2.0;
  vec3 grad = mix(
    mix(uColorA, uColorB, uvGradient.x),
    mix(uColorC, uColorD, uvGradient.y),
    dist * 0.5
  );

  float alphaBase = uAlpha * (1.0 - vTopFade);

  if ( uImageMix <= 0.00001 ) {
    gl_FragColor = vec4(grad, alphaBase);
    return;
  }

  float horizontalProgress = clamp(uEffectsHorizontalProgress, 0.0, 1.0);
  float fadeBlur = clamp(vTopFade * uEffectsBlurFade, 0.0, 0.08);
  float velocityBlur = clamp(abs(uVelocity) * uEffectsBlurVelocity * (1.0 - horizontalProgress), 0.0, 0.08);
  float horizontalBlur = clamp(abs(uVelocity) * uEffectsBlurHorizontal * horizontalProgress, 0.0, 0.08);
  float blurAmount = fadeBlur + velocityBlur + horizontalBlur;
  float velocityDir = sign(uVelocity);
  vec2 blurOffset = vec2(horizontalBlur, fadeBlur + velocityBlur);
  vec2 aberrationOffset = vec2(uEffectsAberration * vTopFade, 0.0);

  vec4 c = texture2D(tDiffuse, uvCover);
  vec3 image = c.rgb;

  if ( blurAmount > 0.00001 ) {
    vec2 dir = blurOffset * (velocityDir == 0.0 ? 1.0 : velocityDir);
    vec3 sampleCenter = c.rgb;

#if DETAILS_QUALITY <= 0
    vec3 sampleNearA = texture2D(tDiffuse, uvCover - dir * 0.7).rgb;
    vec3 sampleNearB = texture2D(tDiffuse, uvCover + dir * 0.7).rgb;
    vec3 blurred = (
      sampleCenter * 0.44
      + sampleNearA * 0.28
      + sampleNearB * 0.28
    );

    image = blurred;
#else
    vec3 sampleNearA = texture2D(tDiffuse, uvCover - dir * 0.5).rgb;
    vec3 sampleNearB = texture2D(tDiffuse, uvCover + dir * 0.5).rgb;
    vec3 sampleFarA = texture2D(tDiffuse, uvCover - dir).rgb;
    vec3 sampleFarB = texture2D(tDiffuse, uvCover + dir).rgb;
    vec3 blurred = (
      sampleCenter * 0.32
      + sampleNearA * 0.24
      + sampleNearB * 0.24
      + sampleFarA * 0.10
      + sampleFarB * 0.10
    );

    float chromaMix = clamp(vTopFade, 0.0, 1.0);
    if ( chromaMix > 0.00001 && abs(uEffectsAberration) > 0.00001 ) {
      vec3 chroma = vec3(
        texture2D(tDiffuse, uvCover + aberrationOffset).r,
        blurred.g,
        texture2D(tDiffuse, uvCover - aberrationOffset).b
      );

      image = mix(blurred, chroma, chromaMix);
    } else {
      image = blurred;
    }
#endif
  }

  vec3 rgb = mix(grad, image, uImageMix);
  float alpha = mix(1.0, c.a, uImageMix) * alphaBase;
  gl_FragColor = vec4(rgb, alpha);
}
`

type UniformValue<T> = { value: T }

type LensMaterialUniforms = {
  iResolution: UniformValue<Vector2>
  tDiffuse: UniformValue<Texture | null>
  uEffectsAberration: UniformValue<number>
  uAlpha: UniformValue<number>
  uEffectsBlurFade: UniformValue<number>
  uEffectsBlurHorizontal: UniformValue<number>
  uEffectsBlurVelocity: UniformValue<number>
  uEffectsHorizontalProgress: UniformValue<number>
  uEffectsHorizontalStrength: UniformValue<number>
  uEffectsHorizontalWaveSmooth: UniformValue<number>
  uEffectsHorizontalWaveSpacing: UniformValue<number>
  uColorA: UniformValue<Vector3>
  uColorB: UniformValue<Vector3>
  uColorC: UniformValue<Vector3>
  uColorD: UniformValue<Vector3>
  uImageMix: UniformValue<number>
  uUvScale: UniformValue<Vector2>
  uRollTopBend: UniformValue<number>
  uRollTopFade: UniformValue<number>
  uRollTopFadeStart: UniformValue<number>
  uRollTopRadius: UniformValue<number>
  uRollTopRange: UniformValue<number>
  uRollTopReturn: UniformValue<number>
  uRollTopStart: UniformValue<number>
  uRollTopWaveAmp: UniformValue<number>
  uRollTopWaveFreq: UniformValue<number>
  uRollTopWaveSmooth: UniformValue<number>
  uRollTopWaveSpacing: UniformValue<number>
  uEffectsWaveSmooth: UniformValue<number>
  uEffectsWaveSpacing: UniformValue<number>
  uScrollPos: UniformValue<number>
  uSize: UniformValue<Vector2>
  uEffectsStrength: UniformValue<number>
  uVelocity: UniformValue<number>
}

type LensMesh = {
  mesh: Mesh<PlaneGeometry, ShaderMaterial>
  material: ShaderMaterial & { uniforms: LensMaterialUniforms }
  geometry: PlaneGeometry
  width: number
  height: number
  requested: boolean
  texture: Texture | null
}

function colorVector(value: string) {
  const color = new Color(value)
  return new Vector3(color.r, color.g, color.b)
}

function calculateUvScale(sourceWidth: number, sourceHeight: number, width: number, height: number) {
  const sourceRatio = sourceWidth / Math.max(sourceHeight, 1)
  const targetRatio = width / Math.max(height, 1)

  return new Vector2(Math.min(targetRatio / sourceRatio, 1), Math.min(sourceRatio / targetRatio, 1))
}

export function LensWebGLLayer({
  active,
  hiddenIndex,
  images,
  imageRefs,
  scrollRef,
}: {
  active: boolean
  hiddenIndex: number | null
  images: readonly string[]
  imageRefs: RefObject<(HTMLButtonElement | null)[]>
  scrollRef: RefObject<HTMLDivElement | null>
}) {
  const layerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(active)
  const hiddenIndexRef = useRef(hiddenIndex)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    hiddenIndexRef.current = hiddenIndex
  }, [hiddenIndex])

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      depth: true,
      stencil: true,
    })
    renderer.sortObjects = false
    renderer.autoClear = false
    renderer.outputColorSpace = SRGBColorSpace
    renderer.setClearColor(0xffffff, 0)
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    layer.appendChild(renderer.domElement)

    const scene = new Scene()
    const camera = new PerspectiveCamera(45, 1, 1, 10000)
    const loader = new TextureLoader()
    loader.setCrossOrigin('anonymous')
    const meshes: LensMesh[] = []
    let width = 1
    let height = 1
    let frame = 0
    let scrollPosition = scrollRef.current?.scrollTop ?? 0
    let previousScrollPosition = scrollPosition
    let velocity = 0
    let velocityTarget = 0
    let disposed = false

    const resizeRenderer = () => {
      width = window.innerWidth
      height = window.innerHeight
      const devicePixelRatio = Number(window.devicePixelRatio) || 1
      const dpr = Math.round(Math.min(Math.max(devicePixelRatio, 1), 2) * 10) / 10

      renderer.setPixelRatio(dpr)
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.position.set(0, 0, 0)
      camera.position.z = height / Math.tan((45 * Math.PI) / 360) / 2
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()

      meshes.forEach(({ material }) => {
        material.uniforms.iResolution.value.set(width, height)
      })
    }

    images.forEach((_, index) => {
      const data = lensImageData[index] ?? lensImageData[0]
      const geometry = new PlaneGeometry(1, 1, 24, 48)
      const material = new ShaderMaterial({
        defines: {
          PI: Math.PI,
          DETAILS_QUALITY: 2,
        },
        uniforms: {
          iResolution: { value: new Vector2(width, height) },
          tDiffuse: { value: null },
          uEffectsAberration: { value: 0.018 },
          uAlpha: { value: 1 },
          uEffectsBlurFade: { value: 0.03 },
          uEffectsBlurHorizontal: { value: 0.001 },
          uEffectsBlurVelocity: { value: 0.0008 },
          uEffectsHorizontalProgress: { value: 0 },
          uEffectsHorizontalStrength: { value: 0.1 },
          uEffectsHorizontalWaveSmooth: { value: 0.72 },
          uEffectsHorizontalWaveSpacing: { value: 1.72 },
          uColorA: { value: colorVector(data.colors[0]) },
          uColorB: { value: colorVector(data.colors[1]) },
          uColorC: { value: colorVector(data.colors[2]) },
          uColorD: { value: colorVector(data.colors[3]) },
          uImageMix: { value: 0 },
          uUvScale: { value: new Vector2(1, 1) },
          uRollTopBend: { value: 48 },
          uRollTopFade: { value: 1 },
          uRollTopFadeStart: { value: 0.3 },
          uRollTopRadius: { value: 500 },
          uRollTopRange: { value: 0.3 },
          uRollTopReturn: { value: 0.3 },
          uRollTopStart: { value: 0.13 },
          uRollTopWaveAmp: { value: 36 },
          uRollTopWaveFreq: { value: 1.45 },
          uRollTopWaveSmooth: { value: 0.68 },
          uRollTopWaveSpacing: { value: 1.22 },
          uEffectsWaveSmooth: { value: 0.72 },
          uEffectsWaveSpacing: { value: 1.28 },
          uScrollPos: { value: 0 },
          uSize: { value: new Vector2(1, 1) },
          uEffectsStrength: { value: 0.03 },
          uVelocity: { value: 0 },
        } satisfies LensMaterialUniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }) as ShaderMaterial & { uniforms: LensMaterialUniforms }
      const mesh = new Mesh(geometry, material)
      mesh.frustumCulled = false
      scene.add(mesh)
      meshes.push({
        mesh,
        material,
        geometry,
        width: 1,
        height: 1,
        requested: false,
        texture: null,
      })
    })

    const requestTexture = (index: number) => {
      const item = meshes[index]
      const imageUrl = images[index]
      if (!item || item.requested || disposed || !imageUrl) return
      item.requested = true
      loader.load(
        imageUrl,
        (texture: any) => {
          if (disposed) {
            texture.dispose()
            return
          }
          texture.colorSpace = SRGBColorSpace
          texture.wrapS = ClampToEdgeWrapping
          texture.wrapT = ClampToEdgeWrapping
          texture.minFilter = LinearMipmapLinearFilter
          texture.magFilter = LinearFilter
          texture.generateMipmaps = true
          texture.needsUpdate = true
          item.texture = texture
          item.material.uniforms.tDiffuse.value = texture
          gsap.to(item.material.uniforms.uImageMix, {
            value: 1,
            duration: 1,
            delay: 0.15,
            ease: 'power2.out',
          })
        },
        undefined,
        () => {
          item.requested = false
        },
      )
    }

    const render = () => {
      const scrollElement = scrollRef.current
      const currentScrollPosition = scrollElement?.scrollTop ?? scrollPosition
      velocityTarget = Math.max(-120, Math.min(currentScrollPosition - previousScrollPosition, 120))
      previousScrollPosition = currentScrollPosition
      scrollPosition = currentScrollPosition
      velocity += (velocityTarget - velocity) * 0.12

      meshes.forEach((item, index) => {
        const element = imageRefs.current?.[index]
        if (!element || !activeRef.current) {
          item.mesh.visible = false
          return
        }

        const rect = element.getBoundingClientRect()
        const inLoadRange = rect.bottom >= -height * 0.35 && rect.top <= height * 1.35
        const inRenderRange = rect.bottom >= -700 && rect.top <= height + 700
        item.mesh.visible = inRenderRange && hiddenIndexRef.current !== index
        if (!inRenderRange) return
        if (inLoadRange) requestTexture(index)

        const itemWidth = Math.max(rect.width, 1)
        const itemHeight = Math.max(rect.height, 1)
        if (Math.abs(item.width - itemWidth) > 0.1 || Math.abs(item.height - itemHeight) > 0.1) {
          const nextGeometry = new PlaneGeometry(itemWidth, itemHeight, 24, 48)
          item.geometry.dispose()
          item.geometry = nextGeometry
          item.mesh.geometry = nextGeometry
          item.width = itemWidth
          item.height = itemHeight
          item.material.uniforms.uSize.value.set(itemWidth, itemHeight)
          const sourceSize = lensImageData[index]?.size ?? [itemWidth, itemHeight]
          item.material.uniforms.uUvScale.value.copy(
            calculateUvScale(sourceSize[0], sourceSize[1], itemWidth, itemHeight),
          )
        }

        item.mesh.position.set(rect.left - width * 0.5 + itemWidth * 0.5, height * 0.5 - rect.top - itemHeight * 0.5, 0)
        item.mesh.scale.set(1, 1, 1)
        item.material.uniforms.uVelocity.value = velocity
        item.material.uniforms.uScrollPos.value = scrollPosition
      })

      renderer.clear()
      if (activeRef.current) renderer.render(scene, camera)
      frame = window.requestAnimationFrame(render)
    }

    resizeRenderer()
    window.addEventListener('resize', resizeRenderer)
    frame = window.requestAnimationFrame(render)

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resizeRenderer)
      meshes.forEach((item) => {
        gsap.killTweensOf(item.material.uniforms.uImageMix)
        scene.remove(item.mesh)
        item.geometry.dispose()
        item.material.dispose()
        item.texture?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [imageRefs, images, scrollRef])

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}
