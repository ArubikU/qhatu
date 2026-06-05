'use client'
import { useEffect, useId, useRef } from 'react'

/**
 * Global GLSL canvas for premium name effects.
 * ONE WebGL context, fixed full-screen, pointer-events none, painted over the DOM.
 * Hidden DOM spans (via useHolo) reserve layout + report their screen rect each frame;
 * the canvas renders each one as shader-lit text. No per-element contexts.
 */

export type HoloMode = 'holo' | 'gold' | 'chrome' | 'blood' | 'rainbow'
const MODE_INT: Record<HoloMode, number> = { holo: 0, gold: 1, chrome: 2, blood: 3, rainbow: 4 }

interface Entry {
  el: HTMLElement
  text: string
  mode: HoloMode
  tex: WebGLTexture | null
  texKey: string         // cache key (text+font+w+h+dpr) → regen on change
}

const registry = new Map<string, Entry>()

/** Register a hidden span to be painted by the global HoloField. */
export function useHolo(text: string, mode: HoloMode) {
  const id  = useId()
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    registry.set(id, { el, text, mode, tex: null, texKey: '' })
    return () => { registry.delete(id) }
  }, [id, text, mode])
  return ref
}

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform float uTime;
uniform int uMode;
varying vec2 vUv;
vec3 pal(float t){ return 0.5 + 0.5*cos(6.28318*(vec3(0.0,0.33,0.67)+t)); }
void main(){
  float a = texture2D(uTex, vUv).a;
  if (a < 0.02) discard;
  float band = vUv.x*2.6 + vUv.y*1.4;
  float t = uTime;
  vec3 col;
  if (uMode == 0) {            // holographic iridescence
    col = pal(band*0.5 + t*0.22);
    float sheen = pow(0.5 + 0.5*sin(band*7.0 - t*3.0), 6.0);
    col = mix(col, vec3(1.0), sheen*0.7);
  } else if (uMode == 1) {     // gold foil
    float s = 0.5 + 0.5*sin(band*5.0 + t*2.2);
    col = mix(vec3(0.55,0.40,0.05), vec3(1.0,0.95,0.62), s);
    col += pow(0.5+0.5*sin(band*9.0 - t*3.0), 8.0);
  } else if (uMode == 2) {     // chrome
    float s = 0.5 + 0.5*sin(band*6.0 + t*2.4);
    col = mix(vec3(0.35,0.38,0.46), vec3(1.0), s);
    col += pow(0.5+0.5*sin(band*11.0 - t*4.0), 10.0)*0.8;
  } else if (uMode == 3) {     // blood
    float s = 0.5 + 0.5*sin(band*4.5 + t*1.6);
    col = mix(vec3(0.32,0.0,0.04), vec3(1.0,0.16,0.26), s);
  } else {                     // rainbow flow
    col = pal(vUv.x*1.2 + t*0.4);
  }
  gl_FragColor = vec4(col, a);
}`

const VERT = `
attribute vec2 aPos;
attribute vec2 aUv;
varying vec2 vUv;
void main(){ vUv = aUv; gl_Position = vec4(aPos, 0.0, 1.0); }`

export function HoloField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true })
    if (!gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog); gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    const aUv  = gl.getAttribLocation(prog, 'aUv')
    gl.enableVertexAttribArray(aPos)
    gl.enableVertexAttribArray(aUv)
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uMode = gl.getUniformLocation(prog, 'uMode')
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)  // premultiplied

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Build/refresh the glyph texture for an entry (white text on transparent)
    const buildTex = (e: Entry, w: number, h: number) => {
      const key = `${e.text}|${getComputedStyle(e.el).font}|${w}x${h}|${dpr}`
      if (e.tex && e.texKey === key) return
      const oc = document.createElement('canvas')
      oc.width = Math.max(1, Math.floor(w * dpr)); oc.height = Math.max(1, Math.floor(h * dpr))
      const ctx = oc.getContext('2d')!
      ctx.scale(dpr, dpr)
      ctx.font = getComputedStyle(e.el).font
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.fillText(e.text, 0, h / 2)
      if (!e.tex) e.tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, e.tex)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, oc)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      e.texKey = key
    }

    let raf = 0
    const t0 = performance.now()
    const loop = () => {
      const W = window.innerWidth, H = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uTime, (performance.now() - t0) / 1000)

      for (const e of Array.from(registry.values())) {
        const r = e.el.getBoundingClientRect()
        if (r.width < 1 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue
        buildTex(e, r.width, r.height)
        if (!e.tex) continue
        // rect → clip space
        const x0 = (r.left / W) * 2 - 1, x1 = (r.right / W) * 2 - 1
        const y0 = 1 - (r.top / H) * 2,  y1 = 1 - (r.bottom / H) * 2
        const verts = new Float32Array([
          x0, y0, 0, 0,  x1, y0, 1, 0,  x0, y1, 0, 1,
          x0, y1, 0, 1,  x1, y0, 1, 0,  x1, y1, 1, 1,
        ])
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW)
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0)
        gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8)
        gl.uniform1i(uMode, MODE_INT[e.mode])
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, e.tex)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }
      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 10 }}
    />
  )
}
