'use client'
import { useEffect, useRef } from 'react'

/**
 * Animated WebGL plasma/aurora ring — used for MYTHIC avatar frames.
 * Raw WebGL1 fragment shader, no deps. Falls back (renders nothing) if WebGL
 * is unavailable so RewardFrame can use its CSS ring instead.
 */
const FRAG = `
precision mediump float;
uniform float uTime;
uniform vec2  uRes;
uniform vec3  uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p  = uv - 0.5;
  float r = length(p) * 2.0;
  float a = atan(p.y, p.x);
  float t = uTime * 0.45;
  // ring band mask
  float ring = smoothstep(0.74, 0.84, r) * (1.0 - smoothstep(0.97, 1.05, r));
  // swirling plasma colour
  float n = noise(vec2(a*2.2 + t, r*5.0 - t));
  float m = 0.5 + 0.5*sin(a*3.0 + t*2.0 + n*4.0);
  vec3 col = mix(uC0, uC1, m);
  col = mix(col, uC2, 0.5 + 0.5*sin(a*2.0 - t*1.6 + n*2.0));
  col = mix(col, uC3, n*0.5);
  // additive glow at the band centre
  float glow = ring + 0.30*exp(-9.0*abs(r-0.90));
  gl_FragColor = vec4(col, clamp(glow, 0.0, 1.0));
}`

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`

function hexToRGB(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return [1, 1, 1]
  const n = parseInt(m[1]!, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function WebGLFrame({ colors, size }: { colors: string[]; size: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true })
    if (!gl) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src); gl.compileShader(sh)
      return sh
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uRes  = gl.getUniformLocation(prog, 'uRes')
    const cs = [0, 1, 2, 3].map((i) => gl.getUniformLocation(prog, `uC${i}`))
    const rgb = [0, 1, 2, 3].map((i) => hexToRGB(colors[i] ?? colors[i % colors.length] ?? '#7B3FF2'))

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uRes, canvas.width, canvas.height)
    cs.forEach((c, i) => gl.uniform3fv(c, rgb[i]!))

    let raf = 0
    const t0 = performance.now()
    const loop = () => {
      gl.uniform1f(uTime, (performance.now() - t0) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); gl.getExtension('WEBGL_lose_context')?.loseContext() }
  }, [colors, size])

  return <canvas ref={ref} style={{ width: size, height: size, display: 'block' }} />
}
