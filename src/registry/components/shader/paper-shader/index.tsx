'use client'

// @ts-nocheck
'use client'
import React from 'react'
import { logger } from '@/registry/utils/logger'

function PA() {
  if (typeof window > 'u') {
    logger.warn('Paper Shaders: can’t create an image on the server')
    return
  }
  const i = new Image()
  return ((i.src = WA), i)
}
const WA = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
function Kg(i) {
  if (i.naturalWidth < 1024 && i.naturalHeight < 1024) {
    if (i.naturalWidth < 1 || i.naturalHeight < 1) return
    const l = i.naturalWidth / i.naturalHeight
    ;((i.width = Math.round(l > 1 ? 1024 * l : 1024)), (i.height = Math.round(l > 1 ? 1024 : 1024 / l)))
  }
}
function Xg(i, l, s) {
  const o = i.createShader(l)
  return o
    ? (i.shaderSource(o, s),
      i.compileShader(o),
      i.getShaderParameter(o, i.COMPILE_STATUS)
        ? o
        : (logger.error('An error occurred compiling the shaders: ' + i.getShaderInfoLog(o)), i.deleteShader(o), null))
    : null
}
const kg = 1920 * 1080 * 4
const OA = ''
let RA = `#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`
function UA() {
  const i = navigator.userAgent.toLowerCase()
  return i.includes('safari') && !i.includes('chrome') && !i.includes('android')
}

function BA() {
  const i = visualViewport?.scale ?? 1,
    l = visualViewport?.width ?? window.innerWidth,
    s = window.innerWidth - document.documentElement.clientWidth,
    o = i * l + s,
    c = outerWidth / o,
    d = Math.round(100 * c)
  return d % 5 === 0 ? d / 100 : d === 33 ? 1 / 3 : d === 67 ? 2 / 3 : d === 133 ? 4 / 3 : c
}

function VA(i, l, s) {
  const o = i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT),
    c = o ? o.precision : null
  c &&
    c < 23 &&
    ((l = l.replace(/precision\s+(lowp|mediump)\s+float;/g, 'precision highp float;')),
    (s = s
      .replace(/precision\s+(lowp|mediump)\s+float/g, 'precision highp float')
      .replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g, '$1 highp $3')))
  const d = Xg(i, i.VERTEX_SHADER, l),
    f = Xg(i, i.FRAGMENT_SHADER, s)
  if (!d || !f) return null
  const m = i.createProgram()
  return m
    ? (i.attachShader(m, d),
      i.attachShader(m, f),
      i.linkProgram(m),
      i.getProgramParameter(m, i.LINK_STATUS)
        ? (i.detachShader(m, d), i.detachShader(m, f), i.deleteShader(d), i.deleteShader(f), m)
        : (logger.error('Unable to initialize the shader program: ' + i.getProgramInfoLog(m)),
          i.deleteProgram(m),
          i.deleteShader(d),
          i.deleteShader(f),
          null))
    : null
}

async function Jg(i) {
  const l = {},
    s = [],
    o = (d) => {
      try {
        return (d.startsWith('/') || new URL(d), !0)
      } catch {
        return !1
      }
    },
    c = (d) => {
      try {
        return d.startsWith('/') ? !1 : new URL(d, window.location.origin).origin !== window.location.origin
      } catch {
        return !1
      }
    }
  return (
    Object.entries(i).forEach(([d, f]) => {
      if (typeof f == 'string') {
        if (!f) {
          l[d] = PA()
          return
        }
        if (!o(f)) {
          logger.warn(`Uniform "${d}" has invalid URL "${f}". Skipping image loading.`)
          return
        }
        const m = new Promise((g, p) => {
          const v = new Image()
          ;(c(f) && (v.crossOrigin = 'anonymous'),
            (v.onload = () => {
              ;(Kg(v), (l[d] = v), g())
            }),
            (v.onerror = () => {
              ;(logger.error(`Could not set uniforms. Failed to load image at ${f}`), p())
            }),
            (v.src = f))
        })
        s.push(m)
      } else (f instanceof HTMLImageElement && Kg(f), (l[d] = f))
    }),
    await Promise.all(s),
    l
  )
}

function IA(i) {
  const l = React.useRef(void 0),
    s = React.useCallback((o) => {
      const c = i.map((d) => {
        if (d != null) {
          if (typeof d == 'function') {
            const f = d,
              m = f(o)
            return typeof m == 'function'
              ? m
              : () => {
                  f(null)
                }
          }
          return (
            (d.current = o),
            () => {
              d.current = null
            }
          )
        }
      })
      return () => {
        c.forEach((d) => d?.())
      }
    }, i)
  return React.useMemo(
    () =>
      i.every((o) => o == null)
        ? null
        : (o) => {
            ;(l.current && (l.current(), (l.current = void 0)), o != null && (l.current = s(o)))
          },
    i,
  )
}

class DA {
  parentElement
  canvasElement
  gl
  program = null
  uniformLocations = {}
  fragmentShader
  rafId = null
  lastRenderTime = 0
  currentFrame = 0
  speed = 0
  currentSpeed = 0
  providedUniforms
  mipmaps = []
  hasBeenDisposed = !1
  resolutionChanged = !0
  textures = new Map()
  minPixelRatio
  maxPixelCount
  isSafari = UA()
  uniformCache = {}
  textureUnitMap = new Map()
  constructor(l, s, o, c, d = 0, f = 0, m = 2, g = kg, p = []) {
    if (l instanceof HTMLElement) this.parentElement = l
    else throw new Error('Paper Shaders: parent element must be an HTMLElement')
    if (!document.querySelector('style[data-paper-shader]')) {
      const x = document.createElement('style')
      ;((x.innerHTML = OA), x.setAttribute('data-paper-shader', ''), document.head.prepend(x))
    }
    const v = document.createElement('canvas')
    ;((this.canvasElement = v),
      this.parentElement.prepend(v),
      (this.fragmentShader = s),
      (this.providedUniforms = o),
      (this.mipmaps = p),
      (this.currentFrame = f),
      (this.minPixelRatio = m),
      (this.maxPixelCount = g))
    const b = v.getContext('webgl2', c)
    if (!b) throw new Error('Paper Shaders: WebGL is not supported in this browser')
    ;((this.gl = b),
      this.initProgram(),
      this.setupPositionAttribute(),
      this.setupUniforms(),
      this.setUniformValues(this.providedUniforms),
      this.setupResizeObserver(),
      visualViewport?.addEventListener('resize', this.handleVisualViewportChange),
      this.setSpeed(d),
      this.parentElement.setAttribute('data-paper-shader', ''),
      (this.parentElement.paperShaderMount = this),
      document.addEventListener('visibilitychange', this.handleDocumentVisibilityChange))
  }
  initProgram = () => {
    const l = VA(this.gl, RA, this.fragmentShader)
    l && (this.program = l)
  }
  setupPositionAttribute = () => {
    const l = this.gl.getAttribLocation(this.program, 'a_position'),
      s = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, s)
    const o = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]
    ;(this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(o), this.gl.STATIC_DRAW),
      this.gl.enableVertexAttribArray(l),
      this.gl.vertexAttribPointer(l, 2, this.gl.FLOAT, !1, 0, 0))
  }
  setupUniforms = () => {
    const l = {
      u_time: this.gl.getUniformLocation(this.program, 'u_time'),
      u_pixelRatio: this.gl.getUniformLocation(this.program, 'u_pixelRatio'),
      u_resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
    }
    ;(Object.entries(this.providedUniforms).forEach(([s, o]) => {
      if (((l[s] = this.gl.getUniformLocation(this.program, s)), o instanceof HTMLImageElement)) {
        const c = `${s}AspectRatio`
        l[c] = this.gl.getUniformLocation(this.program, c)
      }
    }),
      (this.uniformLocations = l))
  }
  renderScale = 1
  parentWidth = 0
  parentHeight = 0
  parentDevicePixelWidth = 0
  parentDevicePixelHeight = 0
  devicePixelsSupported = !1
  resizeObserver = null
  setupResizeObserver = () => {
    ;((this.resizeObserver = new ResizeObserver(([l]) => {
      if (l?.borderBoxSize[0]) {
        const s = l.devicePixelContentBoxSize?.[0]
        ;(s !== void 0 &&
          ((this.devicePixelsSupported = !0),
          (this.parentDevicePixelWidth = s.inlineSize),
          (this.parentDevicePixelHeight = s.blockSize)),
          (this.parentWidth = l.borderBoxSize[0].inlineSize),
          (this.parentHeight = l.borderBoxSize[0].blockSize))
      }
      this.handleResize()
    })),
      this.resizeObserver.observe(this.parentElement))
  }
  handleVisualViewportChange = () => {
    ;(this.resizeObserver?.disconnect(), this.setupResizeObserver())
  }
  handleResize = () => {
    let l = 0,
      s = 0
    const o = Math.max(1, window.devicePixelRatio),
      c = visualViewport?.scale ?? 1
    if (this.devicePixelsSupported) {
      const v = Math.max(1, this.minPixelRatio / o)
      ;((l = this.parentDevicePixelWidth * v * c), (s = this.parentDevicePixelHeight * v * c))
    } else {
      let v = Math.max(o, this.minPixelRatio) * c
      if (this.isSafari) {
        const b = BA()
        v *= Math.max(1, b)
      }
      ;((l = Math.round(this.parentWidth) * v), (s = Math.round(this.parentHeight) * v))
    }
    const d = Math.sqrt(this.maxPixelCount) / Math.sqrt(l * s),
      f = Math.min(1, d),
      m = Math.round(l * f),
      g = Math.round(s * f),
      p = m / Math.round(this.parentWidth)
    ;(this.canvasElement.width !== m || this.canvasElement.height !== g || this.renderScale !== p) &&
      ((this.renderScale = p),
      (this.canvasElement.width = m),
      (this.canvasElement.height = g),
      (this.resolutionChanged = !0),
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height),
      this.render(performance.now()))
  }
  render = (l) => {
    if (this.hasBeenDisposed) return
    if (this.program === null) {
      logger.warn('Tried to render before program or gl was initialized')
      return
    }
    const s = l - this.lastRenderTime
    ;((this.lastRenderTime = l),
      this.currentSpeed !== 0 && (this.currentFrame += s * this.currentSpeed),
      this.gl.clear(this.gl.COLOR_BUFFER_BIT),
      this.gl.useProgram(this.program),
      this.gl.uniform1f(this.uniformLocations.u_time, this.currentFrame * 0.001),
      this.resolutionChanged &&
        (this.gl.uniform2f(this.uniformLocations.u_resolution, this.gl.canvas.width, this.gl.canvas.height),
        this.gl.uniform1f(this.uniformLocations.u_pixelRatio, this.renderScale),
        (this.resolutionChanged = !1)),
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6),
      this.currentSpeed !== 0 ? this.requestRender() : (this.rafId = null))
  }
  requestRender = () => {
    ;(this.rafId !== null && cancelAnimationFrame(this.rafId), (this.rafId = requestAnimationFrame(this.render)))
  }
  setTextureUniform = (l, s) => {
    if (!s.complete || s.naturalWidth === 0)
      throw new Error(`Paper Shaders: image for uniform ${l} must be fully loaded`)
    const o = this.textures.get(l)
    ;(o && this.gl.deleteTexture(o), this.textureUnitMap.has(l) || this.textureUnitMap.set(l, this.textureUnitMap.size))
    const c = this.textureUnitMap.get(l)
    this.gl.activeTexture(this.gl.TEXTURE0 + c)
    const d = this.gl.createTexture()
    ;(this.gl.bindTexture(this.gl.TEXTURE_2D, d),
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE),
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE),
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR),
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR),
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, s),
      this.mipmaps.includes(l) &&
        (this.gl.generateMipmap(this.gl.TEXTURE_2D),
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR)))
    const f = this.gl.getError()
    if (f !== this.gl.NO_ERROR || d === null) {
      logger.error('Paper Shaders: WebGL error when uploading texture:', f)
      return
    }
    this.textures.set(l, d)
    const m = this.uniformLocations[l]
    if (m) {
      this.gl.uniform1i(m, c)
      const g = `${l}AspectRatio`,
        p = this.uniformLocations[g]
      if (p) {
        const v = s.naturalWidth / s.naturalHeight
        this.gl.uniform1f(p, v)
      }
    }
  }
  areUniformValuesEqual = (l, s) =>
    l === s
      ? !0
      : Array.isArray(l) && Array.isArray(s) && l.length === s.length
        ? l.every((o, c) => this.areUniformValuesEqual(o, s[c]))
        : !1
  setUniformValues = (l) => {
    ;(this.gl.useProgram(this.program),
      Object.entries(l).forEach(([s, o]) => {
        let c = o
        if (
          (o instanceof HTMLImageElement && (c = `${o.src.slice(0, 200)}|${o.naturalWidth}x${o.naturalHeight}`),
          this.areUniformValuesEqual(this.uniformCache[s], c))
        )
          return
        this.uniformCache[s] = c
        const d = this.uniformLocations[s]
        if (!d) {
          logger.warn(`Uniform location for ${s} not found`)
          return
        }
        if (o instanceof HTMLImageElement) this.setTextureUniform(s, o)
        else if (Array.isArray(o)) {
          let f = null,
            m = null
          if (o[0] !== void 0 && Array.isArray(o[0])) {
            const g = o[0].length
            if (o.every((p) => p.length === g)) ((f = o.flat()), (m = g))
            else {
              logger.warn(`All child arrays must be the same length for ${s}`)
              return
            }
          } else ((f = o), (m = f.length))
          switch (m) {
            case 2:
              this.gl.uniform2fv(d, f)
              break
            case 3:
              this.gl.uniform3fv(d, f)
              break
            case 4:
              this.gl.uniform4fv(d, f)
              break
            case 9:
              this.gl.uniformMatrix3fv(d, !1, f)
              break
            case 16:
              this.gl.uniformMatrix4fv(d, !1, f)
              break
            default:
              logger.warn(`Unsupported uniform array length: ${m}`)
          }
        } else
          typeof o == 'number'
            ? this.gl.uniform1f(d, o)
            : typeof o == 'boolean'
              ? this.gl.uniform1i(d, o ? 1 : 0)
              : logger.warn(`Unsupported uniform type for ${s}: ${typeof o}`)
      }))
  }
  getCurrentFrame = () => this.currentFrame
  setFrame = (l) => {
    ;((this.currentFrame = l), (this.lastRenderTime = performance.now()), this.render(performance.now()))
  }
  setSpeed = (l = 1) => {
    ;((this.speed = l), this.setCurrentSpeed(document.hidden ? 0 : l))
  }
  setCurrentSpeed = (l) => {
    ;((this.currentSpeed = l),
      this.rafId === null &&
        l !== 0 &&
        ((this.lastRenderTime = performance.now()), (this.rafId = requestAnimationFrame(this.render))),
      this.rafId !== null && l === 0 && (cancelAnimationFrame(this.rafId), (this.rafId = null)))
  }
  setMaxPixelCount = (l = kg) => {
    ;((this.maxPixelCount = l), this.handleResize())
  }
  setMinPixelRatio = (l = 2) => {
    ;((this.minPixelRatio = l), this.handleResize())
  }
  setUniforms = (l) => {
    ;(this.setUniformValues(l),
      (this.providedUniforms = {
        ...this.providedUniforms,
        ...l,
      }),
      this.render(performance.now()))
  }
  handleDocumentVisibilityChange = () => {
    this.setCurrentSpeed(document.hidden ? 0 : this.speed)
  }
  dispose = () => {
    ;((this.hasBeenDisposed = !0),
      this.rafId !== null && (cancelAnimationFrame(this.rafId), (this.rafId = null)),
      this.gl &&
        this.program &&
        (this.textures.forEach((l) => {
          this.gl.deleteTexture(l)
        }),
        this.textures.clear(),
        this.gl.deleteProgram(this.program),
        (this.program = null),
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null),
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null),
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null),
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null),
        this.gl.getError()),
      this.resizeObserver && (this.resizeObserver.disconnect(), (this.resizeObserver = null)),
      visualViewport?.removeEventListener('resize', this.handleVisualViewportChange),
      document.removeEventListener('visibilitychange', this.handleDocumentVisibilityChange),
      (this.uniformLocations = {}),
      this.canvasElement.remove(),
      delete this.parentElement.paperShaderMount)
  }
}

export default React.forwardRef(function PaperShader(
  {
    fragmentShader: l,
    uniforms: s,
    webGlContextAttributes: o,
    speed: c = 0,
    frame: d = 0,
    minPixelRatio: g,
    maxPixelCount: p,
    mipmaps: v,
    style: b,
    className,
    ...x
  }: any,
  R,
) {
  const parentRef = React.useRef(null)
  const j = React.useRef(null)

  React.useEffect(() => {
    let active = true
    ;(async () => {
      const k = await Jg(s)
      if (active && parentRef.current && !j.current) {
        j.current = new DA(parentRef.current, l, k, o, c, d, g, p, v)
      }
    })()
    return () => {
      active = false
      if (j.current) {
        j.current.dispose()
        j.current = null
      }
    }
  }, [l, o, c, d, g, p, v])

  React.useEffect(() => {
    let Q = false
    ;(async () => {
      const it = await Jg(s)
      if (!Q && j.current) j.current.setUniforms(it)
    })()
    return () => {
      Q = true
    }
  }, [s])

  React.useImperativeHandle(R, () => j.current)

  return React.createElement('div', {
    ref: parentRef,
    className,
    'data-paper-shader': '',
    style: { position: 'relative', width: '100%', height: '100%', minHeight: '20rem', ...b },
    ...x,
  })
})
