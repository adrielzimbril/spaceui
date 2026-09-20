// Orchestrates the reveal effect: owns the GL context, drives the render loop,
// forwards config to the specialised modules under ./gl and ./brush.

import { BrushTrail } from './brush'
import { createPlane } from './gl/geometry'
import { mat4 } from './gl/matrix'
import { compileProgram, type UniformName } from './gl/shaders'
import { createMaskTexture, loadImageTexture } from './gl/textures'
import { CanvasRecorder } from './recorder'
import { DEFAULT_CONFIG, type RevealConfig, type RevealImages } from './state'
import { TRAJECTORIES, TRAJECTORY_PERIODS } from './trajectories'

type TexId = 'base' | 'reveal' | 'depth' | 'depthReveal'

export class RevealEngine {
  private canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext | null = null
  private config: RevealConfig = { ...DEFAULT_CONFIG }
  private disposed = false

  private width = 0
  private height = 0

  private program: WebGLProgram | null = null
  private posBuf: WebGLBuffer | null = null
  private idxBuf: WebGLBuffer | null = null
  private idxCount = 0
  private useUint32 = false
  private uniforms: Record<UniformName, WebGLUniformLocation | null> | null = null
  private attribPos = 0

  private textures: Record<TexId, WebGLTexture | null> = {
    base: null,
    reveal: null,
    depth: null,
    depthReveal: null,
  }
  private maskTex: WebGLTexture | null = null

  private maskCanvas: HTMLCanvasElement | null = null
  private maskCtx: CanvasRenderingContext2D | null = null

  private brush = new BrushTrail()
  private mouse = { x: 0, y: 0, nx: 0, ny: 0 }
  private revealFactor = 0
  private currentIntensity = 1
  private lastAct = Date.now()
  private isAutoPlaying = true
  private autoT = 0
  private curRX = 0
  private curRY = 0
  private tgtRX = 0
  private tgtRY = 0

  private raf = 0
  private lastT = performance.now()
  private ready = false

  private recorder: CanvasRecorder

  private onMouseMove = (e: MouseEvent) => this.handleMouseMove(e)

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.recorder = new CanvasRecorder(canvas)
  }

  setConfig(patch: Partial<RevealConfig>) {
    this.config = { ...this.config, ...patch }
    if (patch.pointCount != null) this.brush.resize(this.config.pointCount)
  }

  getConfig(): RevealConfig {
    return this.config
  }

  async setImages(images: RevealImages): Promise<void> {
    this.width = images.width
    this.height = images.height
    this.initGL()
    const gl = this.gl!
    const [base, reveal, depth, depthReveal] = await Promise.all([
      loadImageTexture(gl, images.base),
      loadImageTexture(gl, images.reveal),
      loadImageTexture(gl, images.depthBase),
      loadImageTexture(gl, images.depthReveal),
    ])
    // Free the previous set's GPU textures before swapping in the new ones —
    // otherwise every image/preset change orphans 4 textures permanently.
    for (const t of Object.values(this.textures)) if (t) gl.deleteTexture(t)
    this.textures = { base, reveal, depth, depthReveal }
    this.mouse = { x: this.width / 2, y: this.height / 2, nx: 0, ny: 0 }
    this.brush.reset(this.width / 2, this.height / 2)
    this.brush.resize(this.config.pointCount)
    this.revealFactor = 0
    this.currentIntensity = 1
    this.autoT = 0
    this.isAutoPlaying = true
    this.lastAct = Date.now()
    this.ready = true
    this.canvas.addEventListener('mousemove', this.onMouseMove)
    if (!this.raf) this.startLoop()
  }

  private initGL() {
    if (this.gl) return
    this.canvas.width = this.width
    this.canvas.height = this.height
    const gl = this.canvas.getContext('webgl', {
      preserveDrawingBuffer: true,
      alpha: true,
      premultipliedAlpha: false,
    })
    if (!gl) throw new Error('WebGL not supported')
    this.gl = gl
    gl.viewport(0, 0, this.width, this.height)
    this.useUint32 = !!gl.getExtension('OES_element_index_uint')

    const mc = document.createElement('canvas')
    mc.width = this.width
    mc.height = this.height
    this.maskCanvas = mc
    this.maskCtx = mc.getContext('2d', { alpha: false })
    this.maskTex = createMaskTexture(gl)

    const { program, uniforms, attribPos } = compileProgram(gl)
    this.program = program
    this.uniforms = uniforms
    this.attribPos = attribPos

    const geo = createPlane(this.useUint32)
    this.idxCount = geo.indices.length
    this.posBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf)
    gl.bufferData(gl.ARRAY_BUFFER, geo.positions, gl.STATIC_DRAW)
    this.idxBuf = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuf)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW)
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.ready) return
    const r = this.canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    this.lastAct = Date.now()
    this.isAutoPlaying = false
    this.currentIntensity = 1
    const nx = (e.clientX - r.left) / r.width
    const ny = (e.clientY - r.top) / r.height
    this.mouse.nx = nx * 2 - 1
    this.mouse.ny = ny * 2 - 1
    this.mouse.x = nx * this.width
    this.mouse.y = ny * this.height
    this.tgtRY = this.mouse.nx * ((this.config.rotY * Math.PI) / 180)
    this.tgtRX = this.mouse.ny * ((this.config.rotX * Math.PI) / 180)
  }

  private startLoop() {
    this.lastT = performance.now()
    const step = () => {
      if (this.disposed) return
      this.frame()
      this.raf = requestAnimationFrame(step)
    }
    this.raf = requestAnimationFrame(step)
  }

  private updateAutoPlay(dt: number) {
    const cfg = this.config
    const autoON = cfg.autoMask
    if (!this.isAutoPlaying) {
      if (autoON && Date.now() - this.lastAct > cfg.idleDelay) {
        this.isAutoPlaying = true
        this.autoT = 0
      } else if (Date.now() - this.lastAct < 200) {
        this.revealFactor = Math.min(1, this.revealFactor + 0.15)
      } else {
        this.revealFactor = Math.max(0, this.revealFactor - cfg.fadeSpeed)
      }
    }
    if (this.isAutoPlaying && autoON) {
      const period = TRAJECTORY_PERIODS[cfg.trajectory] ?? 4500
      this.autoT = (this.autoT + (dt * cfg.autoSpeed) / period) % 1
      const pos = (TRAJECTORIES[cfg.trajectory] ?? TRAJECTORIES[0])(this.autoT)
      this.mouse.x = Math.max(0, Math.min(1, pos.x)) * this.width
      this.mouse.y = Math.max(0, Math.min(1, pos.y)) * this.height
      this.mouse.nx = pos.x * 2 - 1
      this.mouse.ny = pos.y * 2 - 1
      this.tgtRY = this.mouse.nx * ((cfg.rotY * Math.PI) / 180)
      this.tgtRX = this.mouse.ny * ((cfg.rotX * Math.PI) / 180)
      this.currentIntensity = 1.25
      this.revealFactor = 1
    }
  }

  private frame() {
    if (!this.ready || !this.gl || !this.program || !this.uniforms) return
    const gl = this.gl
    const cfg = this.config
    const u = this.uniforms
    const now = performance.now()
    const dt = now - this.lastT
    this.lastT = now

    this.updateAutoPlay(dt)

    this.brush.head.x = this.mouse.x
    this.brush.head.y = this.mouse.y
    this.brush.resize(cfg.pointCount)
    this.brush.step(cfg.lerpFactor)
    this.brush.paint(this.maskCtx!, this.width, this.height, cfg, this.currentIntensity, this.revealFactor)

    gl.activeTexture(gl.TEXTURE3)
    gl.bindTexture(gl.TEXTURE_2D, this.maskTex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.maskCanvas!)

    this.curRX += (this.tgtRX - this.curRX) * 0.08
    this.curRY += (this.tgtRY - this.curRY) * 0.08

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.useProgram(this.program)

    const asp = this.canvas.width / this.canvas.height
    const fov = Math.PI / 4
    const cz = 2.5
    let mx = mat4.projection(fov, asp, 0.1, 100)
    mx = mat4.multiply(mx, mat4.translation(0, 0, -cz))
    mx = mat4.multiply(mx, mat4.xRotation(this.curRX))
    mx = mat4.multiply(mx, mat4.yRotation(this.curRY))
    const ia = this.width / this.height
    const vh = 2 * cz * Math.tan(fov / 2)
    const vw = vh * asp
    const sc = Math.max(vw / ia, vh) * cfg.modelScale
    mx = mat4.scale(mx, ia * sc, sc, 1)

    gl.uniformMatrix4fv(u.u_matrix, false, mx)
    gl.uniform2f(u.u_texelSize, 1 / this.width, 1 / this.height)
    gl.uniform1f(u.u_depthScale, 2.5 * cfg.depthIntensity)
    gl.uniform2f(u.u_resolution, this.canvas.width, this.canvas.height)
    gl.uniform3f(u.u_bgBase, ...cfg.bgBase)
    gl.uniform3f(u.u_bgReveal, ...cfg.bgReveal)
    gl.uniform3f(u.u_lineBase, ...cfg.lineBase)
    gl.uniform3f(u.u_lineReveal, ...cfg.lineReveal)
    gl.uniform1f(u.u_time, now * 0.001)
    gl.uniform1f(u.u_edgeSoft, cfg.edgeSoftness * 40.0)
    gl.uniform1f(u.u_gooey, cfg.gooey ? 1 : 0)
    gl.uniform1f(u.u_displace, cfg.displaceAmount)
    gl.uniform1f(u.u_chromatic, cfg.chromaticAmount)
    gl.uniform1f(u.u_topoEnabled, cfg.topoEnabled ? 1 : 0)
    gl.uniform4f(u.u_topoParams, cfg.topoScale, cfg.topoThickness, cfg.topoDistortion, cfg.topoSpeed)

    gl.uniform1i(u.u_baseMap, 0)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.textures.base)
    gl.uniform1i(u.u_revealMap, 1)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.textures.reveal)
    gl.uniform1i(u.u_depthMap, 2)
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, this.textures.depth)
    gl.uniform1i(u.u_maskMap, 3)
    gl.uniform1i(u.u_depthRevealMap, 4)
    gl.activeTexture(gl.TEXTURE4)
    gl.bindTexture(gl.TEXTURE_2D, this.textures.depthReveal)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf)
    gl.enableVertexAttribArray(this.attribPos)
    gl.vertexAttribPointer(this.attribPos, 2, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuf)
    gl.drawElements(gl.TRIANGLES, this.idxCount, this.useUint32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0)
  }

  startRecording(durationSec: number, onProgress?: (s: number) => void): Promise<Blob> {
    this.isAutoPlaying = true
    this.autoT = 0
    return this.recorder.start(durationSec, onProgress)
  }

  cancelRecording() {
    this.recorder.cancel()
  }

  dispose() {
    this.disposed = true
    this.ready = false
    if (this.raf) cancelAnimationFrame(this.raf)
    this.canvas.removeEventListener('mousemove', this.onMouseMove)
    const gl = this.gl
    if (gl) {
      for (const t of Object.values(this.textures)) if (t) gl.deleteTexture(t)
      if (this.maskTex) gl.deleteTexture(this.maskTex)
      if (this.posBuf) gl.deleteBuffer(this.posBuf)
      if (this.idxBuf) gl.deleteBuffer(this.idxBuf)
      if (this.program) gl.deleteProgram(this.program)
    }
  }
}
